import Settings from '../models/Settings.js'

export const googleSheetGet = async (req, res) => {
  try {
    const settings = await Settings.findOne()
    res.json({url: settings?.googleSheetUrl || ''})
  } catch (error) {
    res.status(500).json({error: 'Ошибка при получении URL'})
  }
}

export const googleSheetUpdUrl = async (req, res) => {
  try {
    const {url} = req.body
    if (!url) return res.status(400).json({error: 'URL обязателен'})

    await Settings.updateOne({}, {googleSheetUrl: url}, {upsert: true})
    res.json({message: 'URL обновлен'})
  } catch (error) {
    res.status(500).json({error: 'Ошибка при обновлении URL'})
  }
}
