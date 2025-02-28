import mongoose from 'mongoose'
const ColumnSchema = new mongoose.Schema({
  name: {type: String, required: true},
  items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
})

export default mongoose.model('Column', ColumnSchema)
