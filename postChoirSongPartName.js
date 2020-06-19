const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// create/edit a choir's song
// Parameters:
// - `choirId` - the id of the choir (required)
// - `songId` - the id of the song (required)
// - `partNameId` - the is of the song partName - if matches existing partNameId, that object will be updated, otherwise - new array element will be added -  (required)
// - `name` - the name of the part (required)
const postChoirSongPartName = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // check for mandatory parameters
  if (!opts.choirId || !opts.songId || !opts.partNameId || !opts.name) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // load song
  let doc
  try {
    debug('postChoirSongPartName fetch song', opts.choirId, opts.songId)
    doc = await db.get(opts.choirId + ':song:' + opts.songId)
  } catch (e) {
    return {
      body: { ok: false, message: 'song not found' },
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // see if partNameId is present in partNames
  let index = doc.partNames.length // add to end of array
  for (var i = 0; i < doc.partNames.length; i++) {
    if (doc.partNames[i].partNameId === opts.partNameId) {
      index = i
    }
  }
  doc.partNames[index] = {
    partNameId: opts.partNameId,
    name: opts.name
  }

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('postChoirSongPartName write song', doc)
    await db.insert(doc)
    body = { ok: true, songId: opts.songId }
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

module.exports = postChoirSongPartName
