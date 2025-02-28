import fetch from 'node-fetch'
import axios from 'axios'

export const fetchDataFromGoogleT = async () => {
  try {
    const getURL = await axios.get('http://localhost:4200/api/google-sheet-url')
    const url = getURL.data.url

    if (!url) throw new Error('Ошибка: нету урла.')

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`)

    const data = await response.json()
    const date = new Date()
    const monthName = date.toLocaleString('en-US', {month: 'long'})

    const upData = data.map(mass =>
      mass.reduce((result, row) => {
        row.forEach((cell, index) => {
          if (typeof cell === 'string') {
            if (cell === 'Xpom' && index >= 3) {
              result.push([
                row[index - 3],
                row[index - 2],
                row[index - 1],
                cell,
              ])
            }
            if (cell.includes(monthName)) {
              result.push([cell])
            }
          }
        })
        return result
      }, []),
    )

    const newFormatedMass = formatedMassive(upData)
    return newFormatedMass
    // dispatch(syncCalendarEvents(newFormatedMass))
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    return null
  }
}
const formatedMassive = upData => {
  const massData = upData
    .map(([data, ...dayEvents]) => {
      return dayEvents.map(dayEvent => {
        const dataEvent = formatDateTime(data.toString(), dayEvent[2])
        return {raidlvl: dayEvent[0], ...dataEvent}
      })
    })
    .filter(item =>
      Array.isArray(item)
        ? item.length > 0
        : item !== undefined && item !== null,
    )

  const parsedEventsReady = befPostModifParseEvents(massData)
  return parsedEventsReady
}
//-------
export const befPostModifParseEvents = formatedMassive => {
  if (!Array.isArray(formatedMassive)) {
    console.error('Пришла хуйня с таблиц, пофикси:', formatedMassive)
    return []
  }
  try {
    return formatedMassive.map(fullDay => {
      if (!Array.isArray(fullDay)) {
        console.error('Шакалит какой-то массив дней:', fullDay)
        return []
      }
      return fullDay.map(oneEvent => {
        return {
          title: oneEvent.raidlvl,
          start: `${oneEvent.date} ${oneEvent.time}`,
          end: `${oneEvent.date} ${oneEvent.timeAfter}`,
          calendarId:
            oneEvent.raidlvl?.trim().split(/\s+/)[0].toLowerCase() || 'work',
          raidDif: oneEvent.raidlvl || 'heroic',
        }
      })
    })
  } catch (error) {
    console.error('Проблемы модификации даннх в спарсенном массиве', error)
  }
}
//-------
const formatDateTime = (dateStr, timeStr) => {
  const dateParts = dateStr.match(
    /(?<dayName>\w+) (?<day>\d{2})[a-z]{2} (?<month>\w+)/,
  )
  if (!dateParts || !dateParts.groups) return null
  const {dayName, day, month} = dateParts.groups
  const monthMap = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  }

  const formattedDate = {
    day: dayName,
    date: `${new Date().getFullYear()}-${monthMap[month] || '01'}-${String(
      parseInt(day, 10) + 1,
    ).padStart(2, '0')}`,
    time: timeStr,
    timeAfter: addOneHour(timeStr) || undefined, // Новое поле
  }
  return formattedDate
}
const addOneHour = timeStr => {
  if (typeof timeStr !== 'string' || !timeStr.includes(':')) {
    console.error('Некорректный формат времени:', timeStr)
    return null
  }
  const [hours, minutes] = timeStr?.split(':').map(Number)
  const newHours = (hours + 1) % 24 // Чтобы не выходить за 24 часа
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}`
}
