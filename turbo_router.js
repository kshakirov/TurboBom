var express = require('express')
var router = express.Router()

var bom = require('./controllers/bom')
var whereUsed = require('./controllers/where_used')
var interchange = require('./controllers/interchange')

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

router.delete('/bom/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.removeBom(req,res);
})
router.put('/bom/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.addBom(req,res);
})

router.delete('/interchange/:header_id/item/:item_id', function (req, res) {
    interchange.removeInterchange(req,res);
})
router.put('/interchange/:header_id/item/:item_id', function (req, res) {
    interchange.addInterchange(req,res);
})

router.get('/part/:id/ancestors', function (req, res) {
    whereUsed.findWhereUsed(req,res);
})

router.get('/interchange/:id', function (req, res) {
    interchange.findInterchange(req,res);
})

module.exports = router