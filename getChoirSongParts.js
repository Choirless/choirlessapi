const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// fetch the song parts of a choir's song
// Parameters:
// - `songId` - the song to fetch
const getChoirSongParts = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  if (!opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch parts from database
  let statusCode = 200
  let body = null
  try {
    debug('getChoirSongParts', opts.songId)
    const query = {
      selector: {
        type: 'songpart',
        i2: opts.songId
      }
    }
    const results = await db.find(query)
    body = {
      ok: true,
      parts: results.docs.map((d) => {
        delete d._id
        delete d._rev
        delete d.i1
        delete d.i2
        return d
      })
    }
  } catch (e) {
    body = { ok: false, message: 'song parts not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getChoirSongParts
