const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null

// create a render status object
// partId - the id of the part the triggered the render
// status - the status of the render new/converted/aligned/rendered/composited/done
const postRender = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_RENDER_DATABASE)
  }

  // check for mandatory fields
  if (!opts.partId) {
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
  if (!['new', 'converted', 'aligned', 'rendered', 'composited', 'done'].includes(opts.status)) {
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
      _id: [opts.partId, kuuid.id()].join(':'),
      partId: opts.partId,
      status: opts.status,
      date: new Date().toISOString()
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
