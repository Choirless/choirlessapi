const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// get a list of live invitations
const getInvitationList = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_INVITATION_DATABASE)
  }

  // get invitations doc
  let statusCode = 200
  let body
  try {
    const query = {
      selector: {
        expires: {
          $gt: Date.now()
        }
      }
    }
    debug('getInvitationList', query)
    const response = await db.find(query)
    body = {
      ok: true,
      invitations: response.docs.map((m) => {
        m.inviteId = m._id
        delete m._id
        delete m._rev
        return m
      })
    }
  } catch (e) {
    body = { ok: false, err: 'Failed to fetch invitations' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getInvitationList
