const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null

// create a render status object
// choirId - the id of the choir whose song is being rendered
// songId - the if of song being rendered
// status - the status of the render new/converted/aligned/rendered
const postRender = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_RENDER_DATABASE)
  }

  // check for mandatory fields
  if (!opts.choirId || !opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory fields' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // check the status field
  if (!opts.status) {
    opts.status = 'new'
  }
  if (!['new', 'converted', 'aligned', 'rendered'].includes(opts.status)) {
    return {
      body: { ok: false, message: 'invalid status' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // write render doc
  let statusCode = 200
  let body = {}
  try {
    const doc = {
      _id: [opts.choirId, opts.songId, kuuid.id()].join(':'),
      choirId: opts.choirId,
      songId: opts.songId,
      status: opts.status,
      expires: new Date().toISOString()
    }
    debug('postRender write render status', doc)
    await db.insert(doc)
    statusCode = 200
    body = { ok: true, id: doc._id }
  } catch (e) {
    body = { ok: false, err: 'Failed to create render status' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postRender
