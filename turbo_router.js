var express = require('express')
var router = express.Router()

var bom = require('./controllers/bom')

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
router.get('/bom/:id', function (req, res) {
    bom.findBom(req,res);
})

module.exports = router