var InterchangesModel = require('../../models/interchanges');
InterchangesModel.leaveInterchangeGroup(3).then(function (promise) {
    console.log(promise);
})
