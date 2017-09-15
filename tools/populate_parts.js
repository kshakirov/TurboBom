let fs = require('fs');
let part_model = require('../models/part');

function add_part(part) {
    console.log(`Adding Part [${part._key}]`);
    part_model.addPart(part)
}

var data = fs.readFileSync('metadata_arangodb.json');
parts = JSON.parse(data);
parts.map(function (p) {
    let part = {
        manufacturerId: p.manufacturer.id,
        partTypeId: p.part_type.id,
        partId: p.id,
        _key: p.id.toString()
    };
    add_part(part);
});



