import TableModel from '../models/Table.js'
import UserModel from '../models/User.js'

export const getLatestTable = async (req, res) => {
  try {
    const latestTable = await TableModel.findOne()
      .sort({createdAt: -1})
      .populate('players.player', 'player avatar status')
    res.json(latestTable)
  } catch (error) {
    console.log(error)
    res.status(500).json(error, 'ошибка получения таблицы')
  }
}
export const getAllTables = async (req, res) => {
  try {
    const tables = await TableModel.find({}, 'tableName _id createdAt').sort({
      createdAt: -1,
    })

    res.json(tables)
  } catch (error) {
    console.log(error)
    res.status(500).json({message: 'Ошибка получения списка таблиц'})
  }
}
export const getTableById = async (req, res) => {
  try {
    const {id: tableId} = req.params
    const table = await TableModel.findById(tableId).populate(
      'players.player',
      'player avatar status',
    )

    if (!table) {
      return res.status(404).json({message: 'Таблица не найдена'})
    }

    res.json(table)
  } catch (error) {
    console.log(error)
    res.status(500).json({message: 'Ошибка получения таблицы'})
  }
}
export const setNewTable = async (req, res) => {
  try {
    const players = await UserModel.find({}, '_id')
    const {tableName, period, dayCount} = req.body
    const newTable = new TableModel({
      tableName,
      period,
      players: players.map(player => ({
        player: player._id,
        dataColumns: Array(dayCount).fill(0),
        sum: 0,
      })),
      footerRow: {
        dataColumns: Array(dayCount).fill(0),
        sum: 0,
      },
    })
    await newTable.save()
    res.status(201).json(newTable)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'ошибк создания таблицы',
    })
  }
}

export const patchTableById = async (req, res) => {
  try {
    const {tableId, playerId, dataColumns} = req.body
    console.log('dataColumns', dataColumns)
    const table = await TableModel.findById(tableId)
    if (!table) return res.status(404).json({message: 'Таблица не найдена'})
    if (playerId) {
      const playerData = table.players.find(
        p => p.player.toString() === playerId,
      )
      if (!playerData)
        return res.status(404).json({message: 'Игрок не найден в таблице'})

      playerData.dataColumns = dataColumns
      playerData.sum = dataColumns.reduce((sum, num) => sum + num, 0)
      await table.save()
      res.json(playerData)
    } else {
      table.footerRow.dataColumns = dataColumns
      table.footerRow.sum = dataColumns.reduce((sum, num) => sum + num, 0)
      await table.save()
      res.json(table.footerRow)
    }
  } catch (error) {
    res.status(500).json({
      message: 'ошибк обновления таблицы',
    })
  }
}
