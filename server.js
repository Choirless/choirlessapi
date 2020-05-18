require('dotenv').config({ silent : process.env.NODE_ENV === "production" })
const express = require('express')
const bodyParser = require('body-parser')
const port = 3000
const app = express()
const morgan = require('morgan')

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
const postChoirSongPart = require('./postChoirSongPart.js')
const getChoirSongPart = require('./getChoirSongPart.js')
const getChoirSongParts = require('./getChoirSongParts.js')

// API endpoints
app.get('/user', async (req, res) => {
  const response = await getUser(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/user', async (req, res) => {
  const response = await postUser(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/user/login', async (req, res) => {
  const response = await postUserLogin(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/user/choirs', async (req, res) => {
  const response = await getUserChoirs(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir', async (req, res) => {
  const response = await getChoir(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/members', async (req, res) => {
  const response = await getChoirMembers(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songs', async (req, res) => {
  const response = await getChoirSongs(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/song', async (req, res) => {
  const response = await getChoirSong(req.query)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir', async (req, res) => {
  const response = await postChoir(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/join', async (req, res) => {
  const response = await postChoirJoin(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/song', async (req, res) => {
  const response = await postChoirSong(req.body)
  res.status(response.statusCode).send(response.body)
})

app.post('/choir/songpart', async (req, res) => {
  const response = await postChoirSongPart(req.body)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songparts', async (req, res) => {
  const response = await getChoirSongParts(req.query)
  res.status(response.statusCode).send(response.body)
})

app.get('/choir/songpart', async (req, res) => {
  const response = await getChoirSongPart(req.query)
  res.status(response.statusCode).send(response.body)
})

// 404 everything else
app.use((req, res, next) => {
  res.status(404).send({ ok: false })
})

app.listen(port, () => console.log(`Choirless API test app listening at http://localhost:${port}`))
