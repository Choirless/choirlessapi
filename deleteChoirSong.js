const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// delete a song and its parts
// choirdId - the choir whose song is being changed
// songId - the id of the song being altered
const deleteSong = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_CHOIRLESS_DATABASE)
  }

  // is this a request to edit an existing queue item
  if (!opts.choirId || !opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // get invitation doc
  let statusCode = 200
  let body = { ok: true }
  const id = opts.choirId + ':song:' + opts.songId
  try {
    // delete song
    debug('deleteSong', id)
    const doc = await db.get(id)
    await db.destroy(id, doc._rev)

    // delete song parts
    debug('getChoirSongParts', opts.songId)
    const query = {
      selector: {
        type: 'songpart',
        songId: opts.songId
      }
    }
    const docs = []
    const results = await db.partitionedFind(opts.choirId, query)
    for (const i in results.docs) {
      const part = results.docs[i]
      const obj = {
        _id: part._id,
        _rev: part._rev,
        _deleted: true
      }
      docs.push(obj)
    }
    if (docs.length > 0) {
      await db.bulk({ docs: docs })
    }
  } catch (e) {
    console.log(e)
    body = { ok: false, err: 'Failed to delete song' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = deleteSong
