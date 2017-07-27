var InterchangesModel = require('../models/interchanges');
InterchangesModel.findInterchange(19191).then(function (interchange) {
    console.log(interchange)
})


