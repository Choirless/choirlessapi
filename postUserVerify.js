const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_USERS_DATABASE

// verify a user
// Parameters:
// - userId - the id of the user to edit (or blank to create new one)
const postUserVerify = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  const userId = opts.userId
  let body = null
  let statusCode = 200

  // is this a request to edit an existing user
  if (userId) {
    try {
      debug('postUserVerify', userId)
      const doc = await db.get(userId)
      if (!doc.verified) {
        doc.verified = true
        await db.insert(doc)
      }
      body = { ok: true }
    } catch (e) {
      body = { ok: false, message: 'user not verified' }
      statusCode = 404
    }
  } else {
    body = { ok: false, message: 'missing mandatory parameter userId' }
    statusCode = 400
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postUserVerify
