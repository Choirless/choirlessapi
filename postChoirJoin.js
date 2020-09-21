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

  const id = opts.choirId + ':member:' + opts.userId
  let doc
  try {
    doc = await db.get(id)
    // If we got this far, the user is already a member of the choir.
    // If they are of the same member type, we needn't do anything else
    if (doc.memberType === opts.memberType) {
      return {
        body: { ok: false, reason: 'already a member' },
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' }
      }
    } else {
      // overwrite the member type
      doc.memberType = opts.memberType
    }
  } catch (e) {
    // new membership of choir
    doc = {
      _id: id,
      type: 'choirmember',
      userId: opts.userId,
      choirId: opts.choirId,
      name: opts.name,
      joined: now.toISOString(),
      memberType: opts.memberType
    }
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
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postChoirJoin
