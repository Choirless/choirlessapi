const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null
let qdb = null

// queue a song part for post-processing
// Parameters (add):
// - `choirId` - the id of the choir (required)
// - `songId` - the id of the song (required)
// - `partId` - the id of the part (required for updates, if omitted a new song part is created)
// Parameters (update):
// - `id` - the id of the queue item (required)
// - `status` - the status of the queue item (required)
const postQueueSongPart = async (opts) => {
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
      debug('postQueueSongPart fetch queue item', opts.id)
      doc = await qdb.get(opts.id)
      doc.status = opts.status
      debug('postQueueSongPart update queue item', opts.id)
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
    if (!opts.choirId || !opts.songId || !opts.partId) {
      return {
        body: { ok: false, message: 'missing mandatory parameters' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    try {
      // fetch the part - if it doesn't exist, no queue item is created
      const doc = await db.get(opts.choirId + ':song:' + opts.songId + ':part:' + opts.partId)

      // create queue item
      delete doc._id
      delete doc._rev
      doc.partId = opts.partId
      doc.type = 'songpart'
      doc.status = 'new'
      doc._id = kuuid.id()
      debug('postQueueSongPart write queue item', doc)
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

module.exports = postQueueSongPart
