const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// fetch a queue item by known id
// Parameters:
// - `id` - the queue item to fetch
const getQueue = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_QUEUE_DATABASE)
  }

  // extract parameters
  const id = opts.id
  if (!id) {
    return {
      body: { ok: false, message: 'missing mandatory parameter id' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch queue item from database
  let statusCode = 200
  let body = null
  try {
    debug('getQueue', id)
    const qi = await db.get(id)
    delete qi._rev
    body = { ok: true, queueItem: qi }
  } catch (e) {
    body = { ok: false, message: 'queue item not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getQueue
