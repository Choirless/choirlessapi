const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// delete an invitation
// inviteId - the id of the invitation.
const deleteInvitation = async (opts) => {
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
  let body = { ok: true }
  try {
    debug('deleteInvitation', opts.inviteId)
    const doc = await db.get(opts.inviteId)
    await db.destroy(opts.inviteId, doc._rev)
  } catch (e) {
    body = { ok: false, err: 'Failed to delete invitation' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = deleteInvitation
