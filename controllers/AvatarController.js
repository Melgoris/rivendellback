import playerModel from '../models/User.js'

const updateAvatar = async (req, res) => {
  try {
    const _id = req.body._id
    const avatar = req.body.avatar
    if (!avatar) res.status(400).json({message: 'аватар не выбран'})
    const user = await playerModel.findByIdAndUpdate(_id, {avatar}, {new: true})

    if (!user) {
      return res.status(404).json({message: 'Пользователь не найден'})
    }
    res.json({message: 'Аватар обновлен', user})
  } catch (error) {
    console.error(error)
    res.status(500).json({message: 'Ошибка обновления аватара', error})
  }
}

export default updateAvatar
