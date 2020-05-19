const debug = require('debug')('checkAPIKey')
const Nano = require('nano')

const nano = Nano(process.env.COUCH_URL)
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE)

async function checkAPIKey( req, res, next ){

    const storedKey = await db.get(req.body.key);

    debug(storedKey)

    if(storedKey){
        next();
    } else {
        res.status(401);
        res.json({
            status : "err",
            msg : "Invalid API key"
        })
    }

}

module.exports = checkAPIKey;