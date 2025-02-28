import mongoose from 'mongoose'
const SettingsSchema = new mongoose.Schema({
  googleSheetUrl: {type: String, required: true},
})
export default mongoose.model('Settings', SettingsSchema)
