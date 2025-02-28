import mongoose from 'mongoose'

const CardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    realm: {
      type: String,
      required: true,
    },
    achievement_points: String,
    region: String,
    class: String,
    faction: String,
    gender: String,
    last_crawled_at: String,
    profile_banner: String,
    profile_url: String,
    race: String,
    thumbnail_url: String,
    active_spec_name: String,
    active_spec_role: String,
    closed: {
      type: Boolean,
      default: false,
    },
    saved: {
      type: Boolean,
      default: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    gear: {
      type: Object,
      default: {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
    rang: {
      type: String,
      defoult: '',
    },
    columnId: {type: mongoose.Schema.Types.ObjectId, ref: 'Column'},
  },

  {
    timestamps: true,
  },
)

export default mongoose.model('Card', CardSchema)
