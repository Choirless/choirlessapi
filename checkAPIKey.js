const Nano = require('nano')
const nano = Nano(process.env.COUCH_URL)
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE)

// cache of API keys
const keyCache = {

}

async function checkAPIKey (req, res, next) {
  if (req.query.apikey) {
    // if we've seen this key before, use the cached key
    let storedKey = keyCache[req.query.apikey]
    if (!storedKey) {
      // otherwise fetch from database
      storedKey = await db.get(req.query.apikey)
      keyCache[req.query.apikey] = storedKey
    }

    if (storedKey) {
      next()
    } else {
      res.status(401)
      res.json({
        ok: false,
        status: 'err',
        msg: 'Invalid API key'
      })
    }
  } else {
    res.status(422)
    res.json({
      ok: false,
      status: 'err',
      msg: 'No API key was passed with the request. Please append it to your request url with ?apikey=<YOUR_API_KEY>'
    })
  }
}

module.exports = checkAPIKey
