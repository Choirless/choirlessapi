const debug = require('debug')('keyCreation')
const Nano = require('nano')
const router = require('express').Router();
const kuuid = require('kuuid')

const nano = Nano(process.env.COUCH_URL)
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE)

router.get('/', (req, res, next) => {

    res.sendFile(`${__dirname}/static/key-management.html`)

})

router.post('/create', async (req, res, next) => {

    if(res.locals.w3id_userid && req.body.keyname){

        const keyDetails = {
            _id : kuuid.id(),
            user : res.locals.w3id_userid,
            name : req.body.keyname,
            created : Date.now()
        }

        await db.insert(keyDetails)

        res.json({
            status : "ok",
            msg : "Key successfully created",
            data : {
                key : keyDetails._id
            }
        });

    } else {
        res.status(401);
        res.json({
            status : "err",
            msg : "Required parameters not passed"
        })
    }

})

router.post('/delete', async (req, res, next) => {

    if(req.body.key){

        const existingKey = await db.get(req.body.key)

        if(existingKey){

            await db.destroy(existingKey._id, existingKey._rev)

            res.json({
                status : "ok",
                msg : `Key "${req.body.key} deleted"`
            })

        } else {
            res.status(422);
            res.json({
                status : "err",
                msg : `Key "${req.body.key} could not be found for deletion"`
            })
        }

    } else {
        res.status(422);
        res.json({
            status : "err",
            msg : "No key was passed for deletion"
        })
    }

});

module.exports = router