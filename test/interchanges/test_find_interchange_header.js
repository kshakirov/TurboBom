var InterchangesModel = require('../../models/interchanges');
InterchangesModel.findInterchangeHeaderByItemId(61469).then(function (promise) {
    console.log(promise);
})
