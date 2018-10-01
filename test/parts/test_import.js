let PartController = require('../../models/part'),
    assert = require('assert');

let products = [{id: "uno", _key: "ONE", manufacturer: 'test1',atts:{id: 123, price: 145}},
    {id: "due", _key: "DUE", manufacturer: 'test2', atts:{price: 245}}];
PartController.addBulk(products);
