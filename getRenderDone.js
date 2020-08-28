const Nano = require('nano')
const debug = require('debug')('choirless')
let nano = null
let db = null

// get render done
// choirId - the id of the choir
// songId - the id of the song
const getRenderDone = async (opts) => {
  // connect to db - reuse connection if present
  if (!db) {
    nano = Nano(process.env.COUCH_URL)
    db = nano.db.use(process.env.COUCH_RENDER_DATABASE)
  }

  // check mandatory parameters
  if (!opts.choirId || !opts.songId) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  // get render status doc
  let statusCode = 200
  let body = {}
  try {
    debug('getRenderDone', opts.choirId, opts.songId, opts.partId)
    const query = {
      selector: {
        status: 'done',
        choirId: opts.choirId,
        songId: opts.songId
      },
      sort: [
        { choirId: 'desc' },
        { songId: 'desc' },
        { partId: 'desc' }
      ],
      limit: 50,
      use_index: 'find/completedRenders',
      execution_stats: true
    }
    const result = await db.find(query)
    body.renders = result.docs.map((d) => { delete d._id; delete d._rev; return d })
  } catch (e) {
    body = { ok: false, err: 'Failed to fetch completed renders' }
    statusCode = 404
  }

  // return API response
  return {
    body: body,
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = getRenderDone
