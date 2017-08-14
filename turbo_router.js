var express = require('express')
var router = express.Router()

var bom = require('./controllers/bom');
var whereUsed = require('./controllers/where_used');
var interchange = require('./controllers/interchange');
var part = require('./controllers/part');

// middleware that is specific to this router

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    next()
})
// define the home page route
router.get('/', function (req, res) {
    res.send('urls - /bom/byParentPart/:id,  /part/:id/ancestors')
})
// define the about route
router.get('/bom/byParentPart/:id', function (req, res) {
    bom.findBom(req, res);
})

router.delete('/bom/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.removeBom(req, res);
})
router.put('/bom/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.addBom(req, res);
})

router.delete('/interchanges/:header_id/item/:item_id', function (req, res) {
    interchange.removeInterchange(req, res);
})

router.post('/interchanges/:item_id', function (req, res) {
    interchange.createInterchange(req, res);
})
router.put('/interchanges/:item_id/leave_group', function (req, res) {
    interchange.leaveIntechangeGroup(req, res);
})

router.put('/interchanges/:item_id/merge_group/:picked_id/all', function (req, res) {
    interchange.mergeIterchangeToAnotherItemGroup(req, res);
})


router.put('/interchanges/:in_item_id/merge_group/:out_item_id', function (req, res) {
    interchange.addInterchangeToGroup(req, res);
})


router.get('/interchanges/:header_id', function (req, res) {
    interchange.findInterchangesByHeaderId(req, res);
})


router.post('/parts/:id', function (req, res) {
    part.addPart(req, res);
})

router.put('/parts/:id', function (req, res) {
    part.updatePart(req, res);
})

router.delete('/parts/:id', function (req, res) {
    part.removePart(req, res);
})


router.get('/part/:id/ancestors', function (req, res) {
    whereUsed.findWhereUsed(req, res);
})

router.get('/parts/:id/interchanges', function (req, res) {
    interchange.findInterchange(req, res);
})



module.exports = router
