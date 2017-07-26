var express = require('express')
var router = express.Router()

var bom = require('./controllers/bom')
var whereUsed = require('./controllers/where_used')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})
// define the home page route
router.get('/', function (req, res) {
    res.send('urls - /bom/byParentPart/:id,  /part/:id/ancestors' )
})
// define the about route
router.get('/bom/byParentPart/:id', function (req, res) {
    bom.findBom(req,res);
})
router.get('/part/:id/ancestors', function (req, res) {
    whereUsed.findWhereUsed(req,res);
})

module.exports = router