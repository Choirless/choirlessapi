require('dotenv').config({ silent: process.env.NODE_ENV === 'production' })
const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const app = express()
const morgan = require('morgan')
const mockMiddleware = function (req, res, next) {
  next()
}
const localMode = (process.env.LOCAL_MODE === 'true')
const w3id = localMode ? mockMiddleware : require('w3id-middleware')
const whitelist = localMode ? mockMiddleware : require('./whitelist.js')
const keyProtect = localMode ? mockMiddleware : require('./checkAPIKey.js')

// parsing application/json
app.use(bodyParser.json())

// logging
app.use(morgan('dev'))

// load the actions
const getUser = require('./getUser.js')
const postUser = require('./postUser.js')
const postUserLogin = require('./postUserLogin.js')
const getUserChoirs = require('./getUserChoirs.js')
const getChoir = require('./getChoir.js')
const getChoirMembers = require('./getChoirMembers.js')
const getChoirSong = require('./getChoirSong.js')
const getChoirSongs = require('./getChoirSongs.js')
const postChoir = require('./postChoir.js')
const postChoirJoin = require('./postChoirJoin.js')
const postChoirSong = require('./postChoirSong.js')
const postChoirSongPartName = require('./postChoirSongPartName.js')
const deleteChoirSongPartName = require('./deleteChoirSongPartName.js')
const postChoirSongPart = require('./postChoirSongPart.js')
const getChoirSongPart = require('./getChoirSongPart.js')
const getChoirSongParts = require('./getChoirSongParts.js')
const postQueueMixdown = require('./postQueueMixdown.js')
const postQueueSongPart = require('./postQueueSongPart.js')
const getQueue = require('./getQueue.js')
const postInvitation = require('./postInvitation.js')
const getInvitation = require('./getInvitation.js')
const getInvitationList = require('./getInvitationList.js')
const deleteInvitation = require('./deleteInvitation.js')

// Health endpoint
app.get('/__gtg', async (req, res) => {
  res.end()
})

// API Key Management Endpoints
app.use('/keys', [w3id, whitelist], require('./keyManagement.js'))
app.all('/__auth', w3id)

// API endpoints
app.get('/user', [keyProtect], async (req, res) => {
  const response = await getUser(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/user', [keyProtect], async (req, res) => {
  const response = await postUser(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/user/login', [keyProtect], async (req, res) => {
  const response = await postUserLogin(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/user/choirs', [keyProtect], async (req, res) => {
  const response = await getUserChoirs(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir', [keyProtect], async (req, res) => {
  const response = await getChoir(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/members', [keyProtect], async (req, res) => {
  const response = await getChoirMembers(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songs', [keyProtect], async (req, res) => {
  const response = await getChoirSongs(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/song', [keyProtect], async (req, res) => {
  const response = await getChoirSong(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir', [keyProtect], async (req, res) => {
  const response = await postChoir(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/join', [keyProtect], async (req, res) => {
  const response = await postChoirJoin(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/song', [keyProtect], async (req, res) => {
  const response = await postChoirSong(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/songPartName', [keyProtect], async (req, res) => {
  const response = await postChoirSongPartName(req.body)
  res.status(response.statusCode).send(response.body)
})

app.delete('/choir/songPartName', [keyProtect], async (req, res) => {
  const response = await deleteChoirSongPartName(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/songpart', [keyProtect], async (req, res) => {
  const response = await postChoirSongPart(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songparts', [keyProtect], async (req, res) => {
  const response = await getChoirSongParts(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songpart', [keyProtect], async (req, res) => {
  const response = await getChoirSongPart(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/queue/songpart', [keyProtect], async (req, res) => {
  const response = await postQueueSongPart(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/queue/mixdown', [keyProtect], async (req, res) => {
  const response = await postQueueMixdown(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/queue', [keyProtect], async (req, res) => {
  const response = await getQueue(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/invitation', [keyProtect], async (req, res) => {
  const response = await postInvitation(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/invitation/list', [keyProtect], async (req, res) => {
  const response = await getInvitationList()
  res.status(response.statusCode).send(response.body)
})

app.get('/invitation', [keyProtect], async (req, res) => {
  const response = await getInvitation(req.query)
  res.status(response.statusCode).send(response.body)
})

app.delete('/invitation', [keyProtect], async (req, res) => {
  const response = await deleteInvitation(req.body)
  res.status(response.statusCode).send(response.body)
})

// 404 everything else
app.use((req, res, next) => {
  res.status(404).send({ ok: false })
})

app.listen(port, () => console.log(`Choirless API listening at http://localhost:${port}`))
