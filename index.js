import express from 'express'
import mongoose from 'mongoose'
import {registerValidation, loginValidation} from './validations/auth.js'
import cors from 'cors'
import checkAuth from './utils/checkAuth.js'
import {cardValidation} from './validations/cardsAuth.js'
import * as PlayerController from './controllers/PlayerController.js'
import multer from 'multer'
import {
  create,
  getAll,
  getOne,
  removeCard,
  update,
  deleteCardFromCol,
} from './controllers/CardsController.js'
import {
  getCollumns,
  addCollumns,
  deleteCollumn,
  getColumnsWithCards,
  addCardToColumn,
  fillColumnWithCharacters,
} from './controllers/ColumnsController.js'
import handleErrors from './utils/handleErrors.js'
import updateAvatar from './controllers/AvatarController.js'
import {
  createEvent,
  getAllEvents,
  deleteEvent,
  updateParsedEvents,
} from './controllers/EventController.js'
import {
  setNewTable,
  getLatestTable,
  patchTableById,
  getAllTables,
  getTableById,
} from './controllers/TableController.js'
import {
  googleSheetGet,
  googleSheetUpdUrl,
} from './controllers/SettingsController.js'
import startAutoUpdate from './utils/autoUpdate.js'

mongoose
  .connect(
    'mongodb+srv://blizzkon:iNvqBWDlqPAKkCfx@cluster0.nz0tkjs.mongodb.net/roster?retryWrites=true&w=majority',
  )
  .then(() => console.log('vse ok z bazoy'))
  .catch(err => console.log('db error', err))
const app = express()
const allowedOrigins = [
  'http://localhost:5173',
  'http://rivendell.click',
  'https://rivendell.click',
]
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS not allowed'))
      }
    },
    credentials: true,
  }),
)

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads')
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({storage})
app.use('/uploads', express.static('uploads'))

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  })
})
app.post(
  '/register',
  registerValidation,
  handleErrors,
  PlayerController.register,
)
app.post('/login', loginValidation, handleErrors, PlayerController.login)
app.get('/about', checkAuth, PlayerController.about)
app.get('/players', checkAuth, PlayerController.getPlayers)
app.patch('/user/avatar', updateAvatar)
app.get('/cards', getAll)
app.get('/cards/:id', getOne)
app.post('/cards/add', checkAuth, cardValidation, handleErrors, create)
app.delete('/cards/:id', checkAuth, removeCard)
app.patch('/cards/:id', checkAuth, cardValidation, handleErrors, update)
//колонки
app.post('/columns', addCollumns)
app.post('/columns/:id', deleteCollumn)
// app.get('/columns', getCollumns)
app.get('/columns', getColumnsWithCards)
app.post('/columns/:columnId/add-card', addCardToColumn)
app.post('/columns/:columnId/remove-card', deleteCardFromCol)
app.post('/columns/:columnId/auto-generate', fillColumnWithCharacters)
// app.post('/columns/add-card', addCardToColumn)
// app.post('/columns/remove-card', removeCardFromColumn)
//колонки
app.get('/calendar/events/get', getAllEvents)
app.post('/calendar/events/add', checkAuth, createEvent)
app.delete('/calendar/events', checkAuth, deleteEvent)
app.post('/api/sync-events', updateParsedEvents)
app.get('/api/google-sheet-url', googleSheetGet)
app.post('/api/google-sheet-url', checkAuth, googleSheetUpdUrl)
app.get('/services/table/latest', checkAuth, getLatestTable)
app.get('/services/table', checkAuth, getAllTables)
app.get('/services/table/:id', checkAuth, getTableById)
app.post('/services/table', checkAuth, setNewTable)
app.patch('/services/table/update', checkAuth, patchTableById)
startAutoUpdate()
app.listen(4200, err => {
  if (err) {
    return console.log(err)
  }
  console.log('vse oki')
})
