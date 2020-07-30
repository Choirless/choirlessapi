const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null

// create an invitation
// creator - the id of the user who generated the invitation.
// invitee - the email of the person being invited
// choirId - the choir the invitee is being invited to join
const postInvitation = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_INVITATION_DATABASE)
  }

  // is this a request to edit an existing queue item
  if (!opts.creator) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // write invitation doc
  let statusCode = 200
  let body = {}
  try {
    const doc = {
      _id: kuuid.id(),
      creator: opts.creator,
      invitee: opts.invitee,
      choirId: opts.choirId,
      userId: opts.userId,
      expires: Number(Date.now()) + (1000 * 60 * 60 * 24 * 3)
    }
    debug('postInvitation write invitation item', doc)
    await db.insert(doc)
    statusCode = 200
    body = { ok: true, id: doc._id }
  } catch (e) {
    body = { ok: false, err: 'Failed to create invitation' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postInvitation
