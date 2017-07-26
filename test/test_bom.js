var BomModel = require('../models/bom.js');
BomModel.findBom(41503).then(function (bom) {
    console.log(bom)
})


