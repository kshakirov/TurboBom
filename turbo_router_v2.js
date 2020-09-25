let express = require('express');
let router = express.Router();

let interchange = require('./controllers/interchange_v2');
let bom = require('./controllers/bom_v2');
let altBom = require('./controllers/alternative_bom_v2');
let whereUsed = require('./controllers/where_used_v2');
let kitMatrix = require('./controllers/kit_matrix_v2');
let serviceKits = require('./controllers/service_kits_v2');
let gasketKits = require('./controllers/gasket_kit_v2');

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next()
});

router.get('/interchanges/:header_id', function (req, res) {
    try {
        interchange.findInterchangesByHeaderId(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/interchanges', function (req, res) {
    try {
        interchange.findInterchange(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/ecommerce/parts/:id/interchanges', function (req, res) {
    try {
        interchange.findInterchangeEcommerce(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/metadata/parts/:id/interchanges', function (req, res) {
    try {
        interchange.findInterchange(req, res);
    } catch(e) {
        console.log(e);
    }
});


router.get('/parts/:id/interchanges/:offset/:limit', function (req, res) {
    try {
        interchange.findInterchangesPage(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.put('/interchanges/:item_id/leave_group', function (req, res) {
    try {
        interchange.leaveIntechangeGroup(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.put('/interchanges/:item_id/merge_group/:picked_id/all', function (req, res) {
    try {
        interchange.mergeIterchangeToAnotherItemGroup(req, res);
    } catch(e) {
        console.log(e);
    }
});


router.put('/interchanges/:in_item_id/merge_group/:out_item_id', function (req, res) {
    try {
        interchange.addInterchangeToGroup(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/ecommerce/parts/:id/boms', function (req, res) {
    try {
        bom.findBomEcommerce(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/boms', function (req, res) {
    try {
        bom.findBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/boms/:offset/:limit', function (req, res) {
    try {
        bom.findBomPage(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/boms/only', function (req, res) {
    try {
        bom.findOnlyBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/parts/:id/boms/parents', function (req, res) {
    try {
        bom.findBomAsChild(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.delete('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    try {
        bom.removeBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.put('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    try {
        bom.updateBom(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.post('/boms/:parent_id/descendant/:descendant_id', function (req, res) {
    try {
        bom.addBom(req, res);
    } catch(e) {
        console.log(e);
    }
});






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

router.get('/ecommerce/parts/:id/ancestors', function (req, res) {
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


router.get('/gasket_kit/:id/turbo/', function (req, res) {
    try {
        gasketKits.findTurbosForGasketKit(req, res);
    } catch(e) {
        console.log(e);
    }
});

router.get('/turbo/:id/gasket_kit/', function (req, res) {
    try {
        gasketKits.findGasketKitForTurbo(req, res);
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;
