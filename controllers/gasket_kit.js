let interchange_model = require('../models/interchanges'),
    where_used_model = require('../models/where_used');

function find_gasket_kit_base(sku) {
    return interchange_model.findInterchange(sku).then(interchanges =>{
        let skus = interchanges.map(i=> i.sku);
        skus.push(sku);
        return skus;
    })
}

exports.findGasketKitBase = find_gasket_kit_base;
