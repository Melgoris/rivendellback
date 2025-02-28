import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema(
  {
    player: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {type: String, default: ''},
    status: String,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Player', PlayerSchema)
