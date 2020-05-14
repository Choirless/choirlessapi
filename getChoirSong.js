const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// fetch a song knowing choirId/songId
// Parameters:
// - `choirId` - the choir to fetch
// - `songId` - the song to fetch
const getChoirSong = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  if (!opts.choirId || !opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch song from database
  let statusCode = 200
  let body = null
  try {
    const id = opts.choirId + ':song:' + opts.songId
    debug('getChoirSong', id)
    const song = await db.get(id)
    delete song._id
    delete song._rev
    body = { ok: true, song: song }
  } catch (e) {
    body = { ok: false, message: 'song not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getChoirSong
