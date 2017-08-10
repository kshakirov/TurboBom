var BomModel = require('../models/bom.js');

BomModel.addBom('41503', '19191').then(function (bom) {
    console.log(bom)
})

BomModel.removeBom('41503', '19191').then(function (bom) {
    console.log(bom)
})