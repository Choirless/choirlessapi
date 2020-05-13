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
    debug('getChoir', choirId)
    const query = {
      selector: {
        type: 'choirmember',
        i1: choirId
      }
    }
    const response = await db.find(query)
    body = { ok: true, members: response.docs.map((m) => { delete m._id; delete m._rev; delete m.i1; delete m.i2; return m }) }
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
