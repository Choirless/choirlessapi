const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// create/edit a choir
// Parameters:
// - `choirId` - if omitted a new choir is generated.
// - `name` - name of choir.
// - `description` - description of choir.
// - `createdByUserId` - id of user creating the choir. (required for new choirs)
// - `createdByName` - name of user creating the choir. (required for new choirs)
// - `choirType` - one of `private`/`public`. (required for new choirs)
const postChoir = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  const choirId = opts.choirId
  const now = new Date()
  let doc = {}

  // check choirType is valid
  if (opts.choirType && !['private', 'public'].includes(opts.choirType)) {
    return {
      body: { ok: false, message: 'invalid choirType' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // is this a request to edit an existing choir
  if (choirId) {
    try {
      debug('postChoir fetch choir', choirId)
      doc = await db.get(choirId)
      doc.name = opts.name ? opts.name : doc.name
      doc.description = opts.description ? opts.description : doc.description
      doc.choirType = opts.choirType ? opts.choirType : doc.choirType
      doc.i2 = doc.name
    } catch (e) {
      return {
        body: { ok: false, message: 'choir not found' },
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    }
  } else {
    if (!opts.name || !opts.createdByUserId || !opts.createdByName || !opts.choirType) {
      return {
        body: { ok: false, message: 'missing mandatory parameters name/createdByUserId/createdByName/choirType' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }
    const id = kuuid.id()
    doc = {
      _id: id,
      type: 'choir',
      choirId: id,
      name: opts.name,
      description: opts.description,
      choirType: opts.choirType,
      createdOn: now.toISOString(),
      createdByUserId: opts.createdByUserId,
      createdByName: opts.createdByName,
      i1: now.toISOString(),
      i2: opts.name
    }
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postChoir write choir', doc)
    const response = await db.insert(doc)
    // if this is the creation of a new choir
    if (!doc._rev) {
      // add the choir creator as a member
      const member = {
        _id: response.id + ':member:' + opts.createdByUserId,
        type: 'choirmember',
        choirId: response.id,
        userId: opts.createdByUserId,
        joined: now.toISOString(),
        name: opts.createdByName,
        memberType: 'leader',
        i1: response.id,
        i2: opts.createdByUserId
      }
      await db.insert(member)
    }
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

module.exports = postChoir
