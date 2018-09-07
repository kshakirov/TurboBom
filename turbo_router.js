let express = require('express'),
    router = express.Router(),
    bom = require('./controllers/bom'),
    whereUsed = require('./controllers/where_used'),
    whereUsedCassandra = require('./controllers/where_used_cassandra'),
    interchange = require('./controllers/interchange'),
    part = require('./controllers/part'),
    altBom = require('./controllers/alternative_bom');

// middleware that is specific to this router

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next()
});
// define the home page route
router.get('/', function (req, res) {
    res.send('Bill of materials, interchanges and where used service')
});
// define the about route
router.get('/parts/:id/boms', function (req, res) {
    bom.findBom(req, res);
});

router.get('/parts/:id/boms/only', function (req, res) {
    bom.findOnlyBom(req, res);
});

router.get('/parts/:id/boms/parents', function (req, res) {
    bom.findBomAsChild(req, res);
});

router.delete('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.removeBom(req, res);
});


router.put('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.updateBom(req, res);
});


router.post('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    bom.addBom(req, res);
});

router.delete('/interchanges/:header_id/item/:item_id', function (req, res) {
    interchange.removeInterchange(req, res);
});

router.post('/interchanges/:item_id', function (req, res) {
    interchange.createInterchange(req, res);
});
router.put('/interchanges/:item_id/leave_group', function (req, res) {
    interchange.leaveIntechangeGroup(req, res);
});

router.put('/interchanges/:item_id/merge_group/:picked_id/all', function (req, res) {
    interchange.mergeIterchangeToAnotherItemGroup(req, res);
});


router.put('/interchanges/:in_item_id/merge_group/:out_item_id', function (req, res) {
    interchange.addInterchangeToGroup(req, res);
});


router.get('/interchanges/:header_id', function (req, res) {
    interchange.findInterchangesByHeaderId(req, res);
});


router.post('/parts/:id', function (req, res) {
    part.addPart(req, res);
});

router.put('/parts/:id', function (req, res) {
    part.upsertPart(req, res);
});

router.post('/parts/', function (req, res) {
    part.upsertPart(req, res);
});


router.delete('/parts/:id', function (req, res) {
    part.removePart(req, res);
});

router.get('/parts/:id', function (req, res) {
    part.getPart(req, res);
});


router.get('/parts/:id/ancestors', function (req, res) {
    whereUsed.findWhereUsed(req, res);
});

router.get('/parts/:id/interchanges', function (req, res) {
    interchange.findInterchange(req, res);
});

router.get('/boms/:parent_part_id/children/:child_part_id/alternatives', function (req, res) {
    altBom.findAltBom(req, res);
});

router.delete('/boms/alternatives/:alt_header_id/parts/:part_id', function (req, res) {
    altBom.removeAltBom(req, res);
});

router.post('/boms/:parent_part_id/children/:child_part_id/alternatives/parts/:part_id', function (req, res) {
    altBom.addAltBom(req, res);
});

router.post('/boms/:parent_part_id/children/:child_part_id/alternatives', function (req, res) {
    altBom.addAltGroup(req, res);
});

router.delete('/boms/:parent_part_id/children/:child_part_id/alternatives/:alt_header_id', function (req, res) {
    altBom.removeAltGroup(req, res);
});

router.get('/attrsreader/product/:id/bom/', function (req, res) {
    bom.findBomCassandra(req, res);
});

router.get('/attrsreader/product/:id/where_used/', function (req, res) {
    whereUsedCassandra.findWhereUsedCassandra(req,res);
});

router.get('/attrsreader/product/:id/interchanges/', function (req, res) {
    interchange.findInterchangeCassandra(req,res);
});


module.exports = router;
