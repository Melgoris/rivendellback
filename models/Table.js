import mongoose from 'mongoose'

const TableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
      trim: true,
    },
    dayCount: {
      type: Number,
    },
    period: {type: String, required: true},
    players: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
          // required: true,
        },
        dataColumns: {
          type: [Number],
          default: Array(15).fill(0),
        },
        sum: {
          type: Number,
          default: 0,
        },
      },
    ],
    footerRow: {
      dataColumns: {type: [Number], default: Array(15).fill(0)},
      sum: {type: Number, default: 0},
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('TanTable', TableSchema)
