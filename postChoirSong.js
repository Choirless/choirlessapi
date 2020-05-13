const Nano = require('nano')
const debug = require('debug')('choirless')
const kuuid = require('kuuid')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// create/edit a choir's song
// Parameters:
// - `choirId` - the id of the choir
// - `userId` - the id of the user adding the song
// - `name` - the name of the song
// - `description` - a description of a song
// - `partNames` - an array of parts e.g. `['alto','tenor','soprano']`
const postChoirSong = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // extract parameters
  const choirId = opts.choirId
  const now = new Date()
  let songId
  let doc = {}

  // is this a request to edit an existing choir
  if (opts.choirId && opts.songId) {
    try {
      debug('postChoirSong fetch song', choirId)
      doc = await db.get(opts.choirId + ':song:' + opts.songId)
      doc.name = opts.name ? opts.name : doc.name
      doc.description = opts.description ? opts.description : doc.description
      doc.partNames = Array.isArray(opts.partNames) ? opts.partNames : doc.partNames
      songId = opts.songId
    } catch (e) {
      return {
        body: { ok: false, message: 'song not found' },
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    }
  } else {
    if (!opts.choirId || !opts.userId || !opts.name) {
      return {
        body: { ok: false, message: 'missing mandatory parameters' },
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }
    songId = kuuid.id()
    doc = {
      _id: opts.choirId + ':song:' + songId,
      type: 'song',
      songId: songId,
      choirId: opts.choirId,
      userId: opts.userId,
      name: opts.name,
      description: opts.description || '',
      partNames: opts.partNames || [],
      createdOn: now.toISOString(),
      i1: now.toISOString(),
      i2: opts.userId
    }
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postChoirSong write song', doc)
    await db.insert(doc)
    body = { ok: true, songId: songId }
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

module.exports = postChoirSong
