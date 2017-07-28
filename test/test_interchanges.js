var InterchangesModel = require('../models/interchanges');
InterchangesModel.findInterchange(41503).then(function (bom) {
    console.log(bom)
})


