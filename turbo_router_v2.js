const express = require('express');
const router = express.Router();

const wrapperUtil = require('./wrapper-util');

const interchange = require('./services/interchange_v2');
const bom = require('./services/bom_v2');
const altBom = require('./services/alternative_bom_v2');
const whereUsed = require('./services/where_used_v2');
const kitMatrix = require('./services/kit_matrix_v2');
const serviceKits = require('./services/service_kits_v2');
const gasketKits = require('./services/gasket_kit_v2');
const majorComponents = require('./services/major_component_v2');
const salesNotes = require('./services/sales_notes_v2');
const standardOversize = require('./services/standard_oversize_v2');

router.use(function timeLog(req, res, next) {
    next()
});

router.get('/interchanges/:header_id', (req, res) => wrapperUtil.wrapper(req, res, interchange.findInterchangesByHeaderId, wrapperUtil.pHeaderId, wrapperUtil.redisInterchangeHeaderId));
router.get('/parts/:id/interchanges', (req, res) => wrapperUtil.wrapper(req, res, interchange.findInterchange, wrapperUtil.pId, wrapperUtil.redisInterchangeId));
router.get('/product/:id/interchanges', (req, res) => wrapperUtil.wrapper(req, res, interchange.findInterchangeEcommerce, wrapperUtil.pId, wrapperUtil.redisInterchangeEcommerceId));
router.get('metadata/parts/:id/interchanges', (req, res) => wrapperUtil.wrapper(req, res, interchange.findInterchange, wrapperUtil.pId, wrapperUtil.redisInterchangeId));
router.get('/parts/:id/interchanges/:offset/:limit', (req, res) => wrapperUtil.wrapper(req, res, interchange.findInterchangesPage, wrapperUtil.pIdPage, null));

router.put('/interchanges/:item_id/leave_group', (req, res) => interchange.leaveIntechangeGroup(req, res));
router.put('/interchanges/:item_id/merge_group/:picked_id/all', (req, res) => interchange.mergeIterchangeToAnotherItemGroup(req, res));
router.put('/interchanges/:in_item_id/merge_group/:out_item_id', (req, res) => interchange.addInterchangeToGroup(req, res));


router.get('/product/:id/bom', (req, res) => wrapperUtil.wrapper(req, res, bom.findBomEcommerce, wrapperUtil.pIdAuthorizationDistance, wrapperUtil.redisBomEcommerceId));
router.get('/parts/:id/boms', (req, res) => wrapperUtil.wrapper(req, res, bom.findBom, wrapperUtil.pIdDistanceDepth, wrapperUtil.redisBomId));
router.get('/parts/:id/boms/:offset/:limit', (req, res) => wrapperUtil.wrapper(req, res, bom.findBomPage, wrapperUtil.pOffsetLimitIdDistanceDepth, null));
router.get('/parts/:id/boms/only', (req, res) => wrapperUtil.wrapper(req, res, bom.findOnlyBom, wrapperUtil.pId, wrapperUtil.redisBomOnlyId));
router.get('/parts/:id/boms/parents', (req, res) => wrapperUtil.wrapper(req, res, bom.findBomAsChild, wrapperUtil.pId, wrapperUtil.redisBomChildId));

router.delete('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.removeBom(req, res));
router.put('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.updateBom(req, res));
router.post('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.addBom(req, res));


router.get('/boms/:parent_part_id/children/:child_part_id/alternatives', function (req, res) {
    try {
        altBom.findAltBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/boms/:parent_part_id/children/:child_part_id/alternatives/:offset/:limit', function (req, res) {
    try {
        altBom.findAltBomPage(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.delete('/boms/alternatives/:alt_header_id/parts/:part_id', function (req, res) {
    try {
        altBom.removeAltBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/boms/:parent_part_id/children/:child_part_id/alternatives/parts/:part_id', function (req, res) {
    try {
        altBom.addAltBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/boms/:parent_part_id/children/:child_part_id/alternatives', function (req, res) {
    try {
        altBom.addAltGroup(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.delete('/boms/:parent_part_id/children/:child_part_id/alternatives/:alt_header_id', function (req, res) {
    try {
        altBom.removeAltGroup(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/ancestors', function (req, res) {
    try {
        whereUsed.findWhereUsed(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/product/:id/where_used', function (req, res) {
    try {
        whereUsed.findWhereUsedEcommerce(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/product/:id/where_used/:offset/:limit', function (req, res) {
    try {
        whereUsed.findWhereUsedEcommerce(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/ancestors/:offset/:limit', function (req, res) {
    try {
        whereUsed.findWhereUsedPage(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/kit_matrix/', function (req, res) {
    try {
        kitMatrix.getKitMatrix(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/service_kits/', function (req, res) {
    try {
        serviceKits.findServiceKits(req, res);
    } catch(e) {
        console.log(e);
    }
});


router.get('/product/:id/gasket_kit/', function (req, res) {
    try {
        gasketKits.findTurbosForGasketKit(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/gasket_turbo', function (req, res) {
    try {
        gasketKits.findGasketKitForTurbo(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/major_components/', function (req, res) {
    try {
        majorComponents.getMajorComponents(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/sales_notes/', function (req, res) {
    try {
        salesNotes.findSalesNotes(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/product/sales_notes/', function (req, res) {
    try {
        Promise.resolve(salesNotes.findSalesNotesForSkus(req.body)).then(value => {
            res.json(value);
        });

    } catch(e) {
        console.log(e);
    }
});

router.get('/product/:id/standard_oversize/', function (req, res) {
    try {
        standardOversize.getStandardOversize(req, res);
    } catch(e) {
        console.log(e);
    }
});


module.exports = router;
