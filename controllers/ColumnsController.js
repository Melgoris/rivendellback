import Columns from '../models/Columns.js'
import Card from '../models/Card.js'
import {RAID_BUFFS} from '../utils/randonData.js'

export const getCollumns = async (req, res) => {
  try {
    const columns = await Columns.find()
    const cards = await Card.find()

    const data = columns.map(col => ({
      ...col.toObject(),
      cards: cards.filter(card => col.items.includes(card._id.toString())),
    }))

    res.json(data)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
export const addCollumns = async (req, res) => {
  try {
    const {name} = req.body
    const newColumn = new Columns({name, items: []})
    await newColumn.save()
    res.json(newColumn)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

export const deleteCollumn = async (req, res) => {
  try {
    await Columns.findByIdAndDelete(req.params.id)
    await Card.deleteMany({columnId: req.params.id})
    res.json({message: 'Column deleted'})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
export const getColumnsWithCards = async (req, res) => {
  try {
    const columns = await Columns.find().populate({
      path: 'items',
      populate: {path: 'player', select: 'player'},
    })
    // const columns = await Columns.aggregate([
    //   {
    //     $lookup: {
    //       from: 'cards', // Название коллекции в MongoDB
    //       localField: 'cards', // ID карточек в колонке
    //       foreignField: '_id', // Сопоставление с ID карточек
    //       as: 'cardsData',
    //     },
    //   },
    // ])
    res.json(columns)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
export const addCardToColumn = async (req, res) => {
  try {
    const {cardId} = req.body
    const {columnId} = req.params
    await Columns.findByIdAndUpdate(
      columnId,
      {$addToSet: {items: cardId}},
      {new: true},
    )

    // Делаем карточку "закрытой", если она не закрыта
    await Card.findByIdAndUpdate(cardId, {closed: true})

    res.json({message: 'Card added to column'})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

export const fillColumnWithCharacters = async (req, res) => {
  try {
    const numTotal = Number(req.body.numTotal) || 0
    const numPure = Number(req.body.numPure) || 0
    const {columnId} = req.params

    const column = await Columns.findById(columnId)
    if (!column) return res.status(404).json({error: 'Нету колонки'})

    if (numTotal === 0 && numPure === 0) {
      const mainCards = await Card.find({rang: 'Мейн'})
      column.items = mainCards.map(c => c._id)
      await column.save()
      return res.json(column)
    }

    const allColumns = await Columns.find({})
    const existingPureCharacters = new Set()
    const existingUsersInColumn = new Set()

    allColumns.forEach(col => {
      col.items.forEach(charId => existingPureCharacters.add(charId.toString()))
    })

    const allCards = await Card.find({}).sort({
      saved: 1,
      rang: 1,
    })

    const pureCharacters = []
    const dirtyCharacters = []

    allCards.forEach(card => {
      if (!card.saved && !existingPureCharacters.has(card._id.toString())) {
        pureCharacters.push(card)
      } else if (card.saved) {
        dirtyCharacters.push(card)
      }
    })

    const selectedPure = []
    const usedBuffs = new Set()

    for (const card of pureCharacters) {
      if (selectedPure.length >= numPure) break

      if (existingUsersInColumn.has(card.player.toString())) continue

      const hasBuff = RAID_BUFFS.find(buff => buff.class === card.class)
      if (hasBuff && usedBuffs.has(hasBuff.buffName)) continue

      selectedPure.push(card)
      existingUsersInColumn.add(card.player.toString())
      if (hasBuff) usedBuffs.add(hasBuff.buffName)
    }

    const remainingSlots = numTotal - selectedPure.length

    dirtyCharacters.sort((a, b) => {
      const aBuff = RAID_BUFFS.some(buff => buff.class === a.class)
      const bBuff = RAID_BUFFS.some(buff => buff.class === b.class)
      if (aBuff !== bBuff) return bBuff - aBuff
      return a.rang.localeCompare(b.rang)
    })

    const selectedDirty = []

    for (const card of dirtyCharacters) {
      if (selectedDirty.length >= remainingSlots) break

      if (existingUsersInColumn.has(card.player.toString())) continue

      const hasBuff = RAID_BUFFS.find(buff => buff.class === card.class)
      if (hasBuff && usedBuffs.has(hasBuff.buffName)) continue

      selectedDirty.push(card)
      existingUsersInColumn.add(card.player.toString())
      if (hasBuff) usedBuffs.add(hasBuff.buffName)
    }

    const selectedCards = [...selectedPure, ...selectedDirty]
    column.items = selectedCards.map(c => c._id)

    await column.save()

    // ✅ Обновляем `closed: true` для добавленных персонажей (кроме "Мейн")
    await Card.updateMany(
      {_id: {$in: selectedCards.map(c => c._id)}, rang: {$ne: 'Мейн'}},
      {closed: true},
    )

    // ✅ Проверяем, какие карточки больше не используются в колонках и сбрасываем `closed: false`
    const allUsedCards = new Set()
    const updatedColumns = await Columns.find({})
    updatedColumns.forEach(col => {
      col.items.forEach(charId => allUsedCards.add(charId.toString()))
    })

    await Card.updateMany(
      {_id: {$nin: [...allUsedCards]}}, // ❌ Если карточка нигде не используется
      {closed: false},
    )

    res.json(column)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
