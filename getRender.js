const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// get render status
// choirId - the id of the choir
// songId - the id of the song
// partId - the id of part the triggered the render
const getRender = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_RENDER_DATABASE)
  }

  // check mandatory parameters
  if (!opts.choirId || !opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // get render status doc
  let statusCode = 200
  let body = {}
  try {
    debug('getRender', opts.choirId, opts.songId)
    const id = [opts.choirId, opts.songId, '\uffff'].join(':')
    const response = await db.list({ startkey: id, descending: true, limit: 1, include_docs: true })
    const doc = response.rows ? response.rows[0].doc : null
    if (doc && doc.songId === opts.songId) {
      delete doc._id
      delete doc._rev
      body.ok = true
      body.render = doc
    } else {
      body.ok = false
      statusCode = 404
    }
  } catch (e) {
    body = { ok: false, err: 'Failed to fetch render' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getRender
