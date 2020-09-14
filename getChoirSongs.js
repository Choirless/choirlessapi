const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// fetch the songs of a choir
// Parameters:
// - `choirId` - the choir to fetch
const getChoirSongs = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  if (!opts.choirId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch user from database
  let statusCode = 200
  let body = null
  try {
    debug('getChoirSongs', opts.choirId)
    const query = {
      selector: {
        type: 'song'
      },
      sort: [{ type: 'desc' }] // newest song first
    }
    const results = await db.partitionedFind(opts.choirId, query)
    body = {
      ok: true,
      songs: results.docs.map((d) => {
        delete d._id
        delete d._rev
        return d
      })
    }
  } catch (e) {
    body = { ok: false, message: 'songs not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getChoirSongs
