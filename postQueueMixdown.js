const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null
let qdb = null

// queue a song part for mixdown
// Parameters (add):
// - `choirId` - the id of the choir (required)
// - `songId` - the id of the song (required)
// Parameters (update):
// - `id` - the id of the queue item (required)
// - `status` - the status of the queue item (required)
const postQueueMixdown = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_CHOIRLESS_DATABASE)
    qdb = nano.db.use(process.env.COUCH_QUEUE_DATABASE)
  }

  // extract parameters
  let doc = {}
  let statusCode = 200
  let body = {}

  // is this a request to edit an existing queue item
  if (opts.id && opts.status) {
    // check for mandatory parameters
    if (!['new', 'inprogress', 'complete'].includes(opts.status)) {
      return {
        body: { ok: false, message: 'invalid status' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    try {
      debug('postQueueMixdown fetch queue item', opts.id)
      doc = await qdb.get(opts.id)
      doc.status = opts.status
      debug('postQueueMixdown update queue item', opts.id)
      await qdb.insert(doc)
      statusCode = 200
      body = { ok: true, id: opts.id }
    } catch (e) {
      return {
        body: { ok: false, message: 'song part not found' },
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    }
  } else {
    // check for mandatory parameters
    if (!opts.choirId || !opts.songId) {
      return {
        body: { ok: false, message: 'missing mandatory parameters' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    try {
      // fetch the sing - if it doesn't exist, no queue item is created
      const doc = await db.get(opts.choirId + ':song:' + opts.songId)

      // create queue item
      delete doc._id
      delete doc._rev
      doc.type = 'mixdown'
      doc.status = 'new'
      doc._id = kuuid.id()
      debug('postQueueMixdown write queue item', doc)
      await qdb.insert(doc)
      statusCode = 200
      body = { ok: true, id: doc._id }
    } catch (e) {
      body = { ok: false, err: 'Failed to create queue item' }
      statusCode = 404
    }
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postQueueMixdown
