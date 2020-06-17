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
  if (!opts.songId || !opts.choirId) {
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
        songId: opts.songId
      }
    }
    if (opts.partNameId) {
      query.selector.partNameId = opts.partNameId
    }
    const results = await db.partitionedFind(opts.choirId, query)
    body = {
      ok: true,
      parts: results.docs.map((d) => {
        delete d._id
        delete d._rev
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
