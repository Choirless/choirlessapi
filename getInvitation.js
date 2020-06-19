const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// get an invitation
// inviteId - the id of the user who generated the invitation.
const getInvitation = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_INVITATION_DATABASE)
  }

  // is this a request to edit an existing queue item
  if (!opts.inviteId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // get invitation doc
  let statusCode = 200
  let body = {}
  try {
    debug('getInvitation', opts.inviteId)
    const doc = await db.get(opts.inviteId)
    const now = Number(Date.now())
    if (now > doc.expires) {
      statusCode = 498
      body = { ok: false }
    } else {
      delete doc._rev
      doc.id = doc._id
      delete doc._id
      body = { ok: true, invitation: doc }
    }
  } catch (e) {
    body = { ok: false, err: 'Failed to fetch invitation' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getInvitation
