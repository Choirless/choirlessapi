const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// fetch a song part knowing choirId/songId/partId
// Parameters:
// - `choirId` - the choir to fetch
// - `songId` - the song to fetch
// - `partId` - the part to fetch
const getChoirSongPart = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  if (!opts.choirId || !opts.songId || !opts.partId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch part from database
  let statusCode = 200
  let body = null
  try {
    const id = opts.choirId + ':song:' + opts.songId + ':part:' + opts.partId
    debug('getChoirSongPart', id)
    const part = await db.get(id)
    delete part._id
    delete part._rev
    body = { ok: true, part: part }
  } catch (e) {
    body = { ok: false, message: 'part not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getChoirSongPart
