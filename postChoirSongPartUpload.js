const debug = require('debug')('choirless')
const presign = require('./lib/presign.js')

// generate URL to allow upload of a song part's video
// Parameters:
// - `choirId` - the id of the choir (required)
// - `songId` - the id of the song (required)
// - `partId` - the id of the part (required)
// - `extension` - the file extension (required) e.g. webm
const postChoirSongPartUpload = async (opts) => {
  // check for mandatory paramters
  if (!opts.choirId || !opts.songId || !opts.partId || !opts.extension) {
    return {
      body: { ok: false, message: 'missing mandatory parameters' },
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  debug('postChoirSongPartUpload generate put url', opts.partId)

  // calculate bucket and key
  const method = 'PUT'
  const key = [opts.choirId, opts.songId, opts.partId].join('+') + '.' + opts.extension

  // generate pre-signed URL
  const url = presign(method, key)
  const body = { ok: true, method: method, url: url, bucket: process.env.COS_DEFAULT_BUCKET, key: key }

  // return API response
  return {
    body: body,
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
  }
}

module.exports = postChoirSongPartUpload
