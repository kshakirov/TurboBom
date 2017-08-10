var InterchangesModel = require('../../models/interchanges');
InterchangesModel.findInterchange(61469).then(function (promise) {
    console.log(promise);
})
