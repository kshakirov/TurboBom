var interchangeModel = require('../../models/interchanges');
var partModel = require('../../models/part');
for(var i=1;i<20;i++){
    var product = {
        id: i,
        _key: i.toString(),
        type: 'test'
    }
    partModel.addPart(product);
}

