const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null
const DB_NAME = process.env.COUCH_CHOIRLESS_DATABASE

// delete a partName from a song object
// Parameters:
// choirId - the id of the choir (required)
// songId - the id of the song (required)
// partNameId - the is of the song partName (required)
const deleteChoirSongPartName = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(DB_NAME)
  }

  // check for mandatory parameters
  if (!opts.choirId || !opts.songId || !opts.partNameId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // load song
  let doc
  try {
    debug('deleteChoirSongPartName fetch song', opts.choirId, opts.songId)
    doc = await db.get(opts.choirId + ':song:' + opts.songId)
  } catch (e) {
    return {
      body: { ok: false, message: 'song not found' },
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // see if partNameId is present in partNames
  let index = null
  for (let i = 0; i < doc.partNames.length; i++) {
    if (doc.partNames[i].partNameId === opts.partNameId) {
      index = i
    }
  }
  if (!index) {
    return {
      body: { ok: false, message: 'song partNameId not found' },
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // remove the offending partNameId
  doc.partNames.splice(index, 1)

  // write user to database
  let statusCode = 200
  let body = null
  try {
    debug('deleteChoirSongPartName write song', doc)
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

module.exports = deleteChoirSongPartName
