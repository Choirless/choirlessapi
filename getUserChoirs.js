
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
    db = nano.db.use(process.env.COUCH_CHOIRLESS_DATABASE)
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
    debug('getUserChoirs', userId)
    const query = {
      selector: {
        userId: userId,
        type: 'choirmember'
      },
      fields: ['choirId']
    }
    const memberships = await db.find(query)

    // load choirs that this user is a member of
    const choirIdList = memberships.docs.map((d) => { return d.choirId + ':0' })
    let choirs = { rows: [] }
    if (choirIdList.length > 0) {
      choirs = await db.list({ keys: choirIdList, include_docs: true })
    }
    body = {
      ok: true,
      choirs: choirs.rows.map((m) => {
        const d = m.doc
        delete d._id
        delete d._rev
        return d
      })
    }
  } catch (e) {
    body = { ok: false, message: 'not found' }
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
