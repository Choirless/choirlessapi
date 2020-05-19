const debug = require('debug')('checkAPIKey')
const Nano = require('nano')

const nano = Nano(process.env.COUCH_URL)
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE)

async function checkAPIKey( req, res, next ){

    if(req.query.apikey){

        const storedKey = await db.get(req.query.apikey)
    
        if(storedKey){
            next();
        } else {
            res.status(401);
            res.json({
                status : "err",
                msg : "Invalid API key"
            })
        }

    } else {
        res.status(422);
        res.json({
            status : "err",
            msg : "No API key was passed with the request. Please append it to your request url with ?apikey=<YOUR_API_KEY>"
        });
    }


}

module.exports = checkAPIKey;