var interchangeModel = require('../../models/interchanges');

var headers = [11,12,13,14];
headers.map(function (header) {
    interchangeModel.addInterchangeHeader(header)
})
