var express = require('express')
var router = express.Router()

var bom = require('./controllers/bom')

function getBoms (req, res) {
    bom.findAll(function (error, customers) {
        if (error) {
            log.error(error, 'error finding customers')
            res.status(500).send(error)
            return
        }
        res.json(customers)
    })
}

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})
// define the home page route
router.get('/', function (req, res) {
    res.send('Birds home page')
})
// define the about route
router.get('/boms', function (req, res) {
    getBoms(req,res);
})

module.exports = router