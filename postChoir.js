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
  let choirId = opts.choirId
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
      doc = await db.get(choirId + ':0')
      doc.name = opts.name ? opts.name : doc.name
      doc.description = opts.description ? opts.description : doc.description
      doc.choirType = opts.choirType ? opts.choirType : doc.choirType
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
    choirId = kuuid.id()
    doc = {
      _id: choirId + ':0',
      type: 'choir',
      choirId: choirId,
      name: opts.name,
      description: opts.description,
      choirType: opts.choirType,
      createdOn: now.toISOString(),
      createdByUserId: opts.createdByUserId,
      createdByName: opts.createdByName
    }
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postChoir write choir', doc)
    await db.insert(doc)
    // if this is the creation of a new choir
    if (!doc._rev) {
      // add the choir creator as a member
      const member = {
        _id: choirId + ':member:' + opts.createdByUserId,
        type: 'choirmember',
        choirId: choirId,
        userId: opts.createdByUserId,
        joined: now.toISOString(),
        name: opts.createdByName,
        memberType: 'leader'
      }
      await db.insert(member)
    }
    body = { ok: true, choirId: choirId }
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
