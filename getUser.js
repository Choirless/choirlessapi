const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// fetch a user by known IP address
// Parameters:
// - userId - the id of the user to fetch
const getUser = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_USERS_DATABASE)
  }

  // extract parameters
  const userId = opts.userId
  if (!userId) {
    return {
      body: { ok: false, message: 'missing mandatory parameter userId' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // fetch user from database
  let statusCode = 200
  let body = null
  try {
    debug('getUser', userId)
    const user = await db.get(userId)
    body = {
      ok: true,
      user: user
    }
    // don't show stored password & salt
    delete body.user.password
    delete body.user.salt
    delete body.user._id
    delete body.user._rev
  } catch (e) {
    body = { ok: false, message: 'user not found' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getUser
