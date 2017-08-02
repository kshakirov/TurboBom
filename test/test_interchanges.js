var InterchangesModel = require('../models/interchanges');
const uuidv1 = require('uuid/v1');

InterchangesModel.findInterchange(41503).then(function (bom) {
    console.log(bom)
})


InterchangesModel.addInterchangeHeader(uuidv1()).then(function (bom) {
    console.log(bom)
})


