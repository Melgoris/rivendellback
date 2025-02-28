import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import playerModel from '../models/User.js'

export const register = async (req, res) => {
  try {
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const passHash = await bcrypt.hash(password, salt)

    const doc = new playerModel({
      player: req.body.player,
      avatar: req.body.avatar,
      status: req.body.status,
      passwordHash: passHash,
    })

    const player = await doc.save()
    const token = jwt.sign(
      {
        _id: player._id,
      },
      'zalupenia1',
      {
        expiresIn: '30d',
      },
    )
    const {passwordHash, ...playerData} = player._doc

    res.json({
      ...playerData,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Ошибка регистрации',
    })
  }
}

export const login = async (req, res) => {
  try {
    const player = await playerModel.findOne({player: req.body.player})
    if (!player) {
      return res.status(404).json({
        message: 'Игрока нету в базе',
      })
    }
    const isValidPass = await bcrypt.compare(
      req.body.password,
      player._doc.passwordHash,
    )
    if (!isValidPass) {
      return res.status(403).json({
        message: 'Не верные данные',
      })
    }
    const token = jwt.sign(
      {
        _id: player._id,
      },
      'zalupenia1',
      {
        expiresIn: '30d',
      },
    )

    const {passwordHash, ...playerData} = player._doc

    res.json({
      ...playerData,
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Ошибка авторизации',
    })
  }
}

export const about = async (req, res) => {
  try {
    const player = await playerModel.findById(req.playerID)
    if (!player) {
      return res.status(404).json({
        message: 'Игрока нет в базе',
      })
    }
    const {passwordHash, ...playerData} = player._doc

    res.json(playerData)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'нет доступа',
    })
  }
}
export const getPlayers = async (req, res) => {
  try {
    const players = await playerModel.find().select('player avatar status')
    res.json(players)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'нет доступа',
    })
  }
}
