import CardModel from '../models/Card.js'
import Columns from '../models/Columns.js'
const cardData = req => {
  const cData = {
    achievement_points: req.body.achievement_points,
    name: req.body.name,
    realm: req.body.realm,
    region: req.body.region,
    class: req.body.class,
    faction: req.body.faction,
    gender: req.body.gender,
    last_crawled_at: req.body.last_crawled_at,
    profile_banner: req.body.profile_banner,
    profile_url: req.body.profile_url,
    race: req.body.race,
    thumbnail_url: req.body.thumbnail_url,
    active_spec_name: req.body.active_spec_name,
    active_spec_role: req.body.active_spec_role,
    gear: req.body.gear || {},
    player: req.playerID,
    closed: req.body.closed,
    saved: req.body.saved,
    visible: req.body.visible,
    rang: req.body.rang,
  }
  return cData
}

export const getAll = async (req, res) => {
  try {
    checkClosedCards()
    const {userId, name, server} = req.query
    const query = {}
    if (name) query.name = name
    if (userId) query.player = userId
    if (server) query.realm = server
    const cards = await CardModel.find(query)
      .sort({closed: 1, saved: -1})
      .populate('player', 'player')
      .exec()
    res.json(cards)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'не получилось получить чариков :(',
    })
  }
}

export const getOne = async (req, res) => {
  try {
    const cardId = req.params.id
    const doc = await CardModel.findById(cardId)

    if (!doc) {
      return res.status(404).json({
        message: 'не получилось получить чарика :(',
      })
    }

    res.json(doc)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'не получилось получить чариков :(',
    })
  }
}

export const removeCard = async (req, res) => {
  try {
    const cardId = req.params.id
    const doc = await CardModel.findOneAndDelete({_id: cardId})

    if (!doc) {
      return res.status(404).json({
        message: 'нету такого чарика :(',
      })
    }

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'не получилось удалить чариков :(',
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new CardModel(cardData(req))
    const card = await doc.save()
    res.json(card)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'братан, хуйня, давай по новой',
    })
  }
}

export const update = async (req, res) => {
  try {
    const cardId = req.params.id
    const updData = req.body
    console.log(req.body)
    await CardModel.updateOne({_id: cardId}, {$set: updData})

    res.json(cardId)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'не удалось обновить чарика',
    })
  }
}

// export const addCardToColl = async (req, res) => {
//   try {
//     const {cardId} = req.body
//     const {columnId} = req.params

//     await Columns.findByIdAndUpdate(columnId, {
//       $addToSet: {cards: cardId},
//     })

//     await CardModel.findByIdAndUpdate(cardId, {closed: true})
//     res.json({message: 'Карточка добавлена в колонку'})
//   } catch (error) {
//     res.status(500).json({error: error.message})
//   }
// }

export const deleteCardFromCol = async (req, res) => {
  try {
    const {cardId} = req.body
    const {columnId} = req.params

    await Columns.findByIdAndUpdate(columnId, {
      $pull: {items: cardId},
    })

    const otherColumns = await Columns.find({items: cardId})

    if (otherColumns.length === 0) {
      await CardModel.findByIdAndUpdate(cardId, {closed: false})
    }

    res.json({message: 'Карточка удалена с колонки'})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

export const checkClosedCards = async () => {
  try {
    const columns = await Columns.find()
    const cardIdsInColumns = columns.flatMap(col =>
      col.items.map(id => id.toString()),
    ) // Все карточки, которые есть в колонках
    // Обновляем карточки: если они закрыты, но их нет в колонках → ставим closed: false
    await CardModel.updateMany(
      {closed: true, _id: {$nin: cardIdsInColumns}}, // Если карточка не в колонке
      {closed: false},
    )

    console.log('закрытые карточки пофиксшены.')
  } catch (error) {
    console.error('Error updating closed cards:', error)
  }
}
