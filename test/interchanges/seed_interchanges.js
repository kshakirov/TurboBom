var interchangeModel = require('../../models/interchanges');

var products = []
for (var i = 1; i < 20; i++) {
    products.push(i);
}

products.slice(0, 5).map(function (p) {
    interchangeModel.addInterchange(11, p);
})

products.slice(6, 17).map(function (p) {
    interchangeModel.addInterchange(12, p);
})

interchangeModel.addInterchange(13, 19);



