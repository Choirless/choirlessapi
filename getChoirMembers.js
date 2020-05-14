const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// fetch choir members
// Parameters:
// - `choirId` - the choir to fetch
const getChoirMembers = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  const choirId = opts.choirId
  if (!choirId) {
    return {
      body: { ok: false, message: 'missing mandatory parameter choirId' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch user from database
  let statusCode = 200
  let body = null
  try {
    debug('getChoirMembers', choirId)
    const query = {
      selector: {
        type: 'choirmember'
      }
    }
    const response = await db.partitionedFind(choirId, query)
    body = {
      ok: true,
      members: response.docs.map((m) => {
        delete m._id
        delete m._rev
        return m
      })
    }
  } catch (e) {
    body = { ok: false, message: 'choir not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getChoirMembers
