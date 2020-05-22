const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
const sha256 = require('./lib/sha256.js')
let nano = null
let db = null

// create/edit a user
// Parameters:
// - userId - the id of the user to edit (or blank to create new one)
// - name - name of user
// - password - password of user
// - email - email of user
const postUser = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_USERS_DATABASE)
  }

  // extract parameters
  const userId = opts.userId
  let doc = {}

  // is this a request to edit an existing user
  if (userId) {
    try {
      debug('postUser fetch user', userId)
      doc = await db.get(userId)
      doc.name = opts.name ? opts.name : doc.name
      doc.email = opts.email ? opts.email : doc.email
      if (opts.password) {
        doc.salt = kuuid.id()
        doc.password = sha256(doc.salt + opts.password)
      }
      doc.verified = !!opts.verified
    } catch (e) {
      return {
        body: { ok: false, message: 'user not found' },
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    }
  } else {
    // new user creation
    if (!opts.name || !opts.password || !opts.email) {
      return {
        body: { ok: false, message: 'missing mandatory parameters name/password/email' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    // first check that user with this email doesn't already exist
    const query = {
      selector: {
        email: opts.email
      }
    }
    const result = await db.find(query)
    if (result.docs && result.docs.length > 0) {
      return {
        body: { ok: false, message: 'duplicate user' },
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    // create user
    const id = kuuid.id()
    const salt = kuuid.id()
    const now = new Date()
    doc = {
      _id: id,
      type: 'user',
      userId: id,
      name: opts.name,
      email: opts.email,
      salt: salt,
      password: sha256(salt + opts.password),
      verified: false,
      createdOn: now.toISOString()
    }
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postUser write user', doc)
    const response = await db.insert(doc)
    body = { ok: true, userId: response.id }
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

module.exports = postUser
