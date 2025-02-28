import Events from '../models/Events.js'

const eventdData = req => {
  const eData = {
    title: req.body.title,
    description: req.body.description || '',
    start: new Date(req.body.start),
    end: new Date(req.body.end),
    calendarId: req.body.calendarId || 'default',
    player: req.playerID,
    raidDif: req.body.raidDif,
    people: req.body.people || [],
    eventType: req.body.eventType || '',
    style: req.body.style || {},
  }

  return eData
}

export const createEvent = async (req, res) => {
  try {
    // const eventData = eventdData(req)
    // if (new Date(eventData.end) < new Date(eventData.start)) {
    //   return res
    //     .status(400)
    //     .json({error: 'Дата окончания должна быть позже даты начала'})
    // }
    const newEvent = new Events(eventdData(req))
    const event = await newEvent.save()
    res.json(event)

    console.log('Событие создано:', newEvent)
  } catch (error) {
    console.error('Ошибка при создании события:', error)
    res.status(500).json({error: 'Не удалось создать событие', error})
  }
}
export const deleteEvent = async (req, res) => {
  console.log('req.query:', req.query)
  console.log('req.params:', req.params)
  try {
    const eventId = req.query.id

    // const eventStart = req.params?.start
    const event = await Events.findOneAndDelete({
      _id: eventId,
    })

    if (!event) {
      return res.status(404).json({
        message: 'нету такого чарика :(',
      })
    }

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('Ошибка удаления:', error)
    res.status(500).json({error: 'Не удалось удалить событие', error})
  }
}
export const getAllEvents = async (req, res) => {
  try {
    const events = await Events.find()
    res.json(events)
  } catch (error) {
    console.error('Ошибка при получении событий:', error)
  }
}

export const updateParsedEvents = async (req, res) => {
  try {
    const newEvents = req.body.events
    let updated = 0,
      created = 0,
      deleted = 0

    const dayOff = await Events.find({
      title: {$regex: `^Выходной`},
    }).lean()
    const dayOffMap = new Map(dayOff.map(event => [event.start, event]))

    for (const events of newEvents) {
      const date = events[0]?.start.split(' ')[0]
      const existingEvents = await Events.find({
        start: {$regex: `^${date}`},
      }).lean()
      const existingMap = new Map(
        existingEvents.map(event => [event.start, event]),
      )

      const createPromises = []
      const updatePromises = []
      const deleteKeys = []

      for (const newEvent of events) {
        const newKey = newEvent.start
        const existingEvent = existingMap.get(newKey)

        if (!existingEvent) {
          createPromises.push(Events.create(newEvent))
          created++
        } else {
          if (
            existingEvent.title !== newEvent.title ||
            existingEvent.end !== newEvent.end
          ) {
            updatePromises.push(Events.updateOne({start: newKey}, newEvent))
            updated++
          }
          existingMap.delete(newKey)
        }
      }

      for (const [start] of existingMap) {
        if (!dayOffMap.has(start)) {
          deleteKeys.push(start)
        }
      }

      await Promise.all([
        ...createPromises,
        ...updatePromises,
        deleteKeys.length
          ? Events.deleteMany({start: {$in: deleteKeys}})
          : Promise.resolve(),
      ])
      deleted += deleteKeys.length
    }

    // Загружаем обновленные данные после изменений
    const updatedEvents = await Events.find().lean()

    console.log(
      `Обновлено: ${updated}, Создано: ${created}, Удалено: ${deleted}`,
    )
    res
      .status(200)
      .json({success: true, updated, created, deleted, events: updatedEvents})
  } catch (error) {
    console.error('Ошибка при обновлении событий:', error)
    res.status(500).json({success: false, error: error.message})
  }
}
