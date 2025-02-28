import mongoose from 'mongoose'

const EventsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    calendarId: {
      type: String,
      default: 'default',
    },
    raidDif: {
      type: String,
      default: 'Героик',
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      // required: true,
    },
    people: {
      type: [String],
      default: [],
    },
    eventType: {
      type: String,
      default: 'normal',
    },
    style: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Event', EventsSchema)
