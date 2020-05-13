const Nano = require('nano')
const debug = require('debug')('choirless')
const sha256 = require('./lib/sha256.js')
let nano = null
let db = null
let choirlessdb = null

// fetch a user with username & password
// Parameters:
// - email - the email address of the user
// - password - the password
const postUserLogin = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_USERS_DATABASE)
    choirlessdb = nano.db.use(process.env.COUCH_CHOIRLESS_DATABASE)
  }

  // fetch user from database
  let statusCode = 200
  let body = null
  try {
    const query = {
      selector: {
        email: opts.email
      }
    }
    debug('postUserLogin', query)
    const result = await db.find(query)
    const doc = result.docs ? result.docs[0] : null

    // if there is a doc for this email address and the password is correct
    if (doc && sha256(doc.salt + opts.password) === doc.password) {
      // fetch choir memberships
      const query = {
        selector: {
          type: 'choirmember',
          i2: doc._id
        },
        fields: ['choirId']
      }
      const memberships = await choirlessdb.find(query)

      // load choirs that this user is a member of
      const choirIdList = memberships.docs.map((d) => { return d.choirId })
      let choirs = { rows: [] }
      if (choirIdList.length > 0) {
        choirs = await choirlessdb.list({ keys: choirIdList, include_docs: true })
      }

      // form the response
      body = {
        ok: true,
        user: doc,
        choirs: choirs.rows.map((a) => {
          const d = a.doc
          delete d._id
          delete d._rev
          delete d.i1
          delete d.i2
          return d
        })
      }
      // don't show stored password & salt
      delete body.user.password
      delete body.user.salt
      delete body.user._id
      delete body.user._rev
    } else {
      body = { ok: false }
      statusCode = 403
    }
  } catch (e) {
    body = { ok: false }
    statusCode = 403
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postUserLogin
