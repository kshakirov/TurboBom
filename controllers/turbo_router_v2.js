const express = require('express');
const router = express.Router();

const interchange = require('../controllers/partials/interchange');
const bom = require('../controllers/partials/bom');
const altBom = require('../controllers/partials/alternative-bom');
const whereUsed = require('../services/where_used_v2');
const kitMatrix = require('../services/kit_matrix_v2');
const serviceKits = require('../services/service_kits_v2');
const gasketKits = require('../services/gasket_kit_v2');
const majorComponents = require('../services/major_component_v2');
const salesNotes = require('../services/sales_notes_v2');
const standardOversize = require('../services/standard_oversize_v2');

router.use(function timeLog(req, res, next) {
    next()
});

router.get('/interchange/:header_id', (req, res) => interchange.findByHeaderId(req, res));
router.get('/parts/:id/interchange', (req, res) => interchange.find(req, res));
router.get('/product/:id/interchange', (req, res) => interchange.findEcommerce(req, res));
router.get('metadata/parts/:id/interchange', (req, res) => interchange.find(req, res));
router.get('/parts/:id/interchange/:offset/:limit', (req, res) => interchange.findPage(req, res));

router.put('/interchange/:item_id/leave_group', (req, res) => interchange.leaveGroup(req, res));
router.put('/interchange/:item_id/merge_group/:picked_id/all', (req, res) => interchange.mergeToAnotherItemGroup(req, res));
router.put('/interchange/:in_item_id/merge_group/:out_item_id', (req, res) => interchange.addToGroup(req, res));


router.get('/product/:id/bom', (req, res) => bom.findBomEcommerce(req, res));
router.get('/parts/:id/boms', (req, res) => bom.find(req, res));
router.get('/parts/:id/boms/:offset/:limit', (req, res) => bom.findBomPage(req, res));
router.get('/parts/:id/boms/only', (req, res) => bom.findOnlyBom(req, res));
router.get('/parts/:id/boms/parents', (req, res) => bom.findBomAsChild(req, res));

router.delete('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.removeBom(req, res));
router.put('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.updateBom(req, res));
router.post('/boms/:parent_id/descendant/:descendant_id', (req, res) => bom.addBom(req, res));


router.get('/boms/:parent_part_id/children/:child_part_id/alternatives', (req, res) => altBom.findAltBom(req, res));
router.get('/boms/:parent_part_id/children/:child_part_id/alternatives/:offset/:limit', (req, res) => altBom.findAltBomPage(req, res));

router.delete('/boms/alternatives/:alt_header_id/parts/:part_id', (req, res) => altBom.removeAltBom(req, res));
router.post('/boms/:parent_part_id/children/:child_part_id/alternatives/parts/:part_id', (req, res) => altBom.addAltBom(req, res));
router.post('/boms/:parent_part_id/children/:child_part_id/alternatives', (req, res) => altBom.addAltGroup(req, res));
router.delete('/boms/:parent_part_id/children/:child_part_id/alternatives/:alt_header_id', (req, res) => altBom.removeAltGroup(req, res));

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
