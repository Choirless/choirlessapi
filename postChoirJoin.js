const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// let a user join a choir
// Parameters:
// - `choirId` - choir being joined
// - `userId` - id of user joining
// - `name` - name of user joining.
// - `memberType` - role in choir
const postChoirJoin = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  const now = new Date()

  // check choirType is valid
  if (!opts.choirId || !opts.userId || !opts.name || !opts.memberType || !['leader', 'member'].includes(opts.memberType)) {
    return {
      body: { ok: false, message: 'invalid parameterss' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  const doc = {
    _id: opts.choirId + ':member:' + opts.userId,
    type: 'choirmember',
    userId: opts.userId,
    choirId: opts.choirId,
    name: opts.name,
    joined: now.toISOString(),
    memberType: opts.memberType
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postChoirJoin write ', doc)
    const response = await db.insert(doc)
    body = { ok: true, choirId: response.id }
  } catch (e) {
    body = { ok: false }
    statusCode = 404
    if (e.statusCode === 409) {
      statusCode = 409
      body.reason = 'already a member'
    }
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postChoirJoin
