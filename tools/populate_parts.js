var fs = require('fs');
var part_model = require('../models/part');

function add_part(part) {
    console.log(`Adding Part [${part._key}]`)
    part_model.addPart(part)
}

var data = fs.readFileSync('metadata_arangodb_interchanges.json');
parts = JSON.parse(data);
parts.map(function (p) {
    var part = {
        manufacturer: p.manufacturer,
        description: p.description,
        partType: p.part_type,
        partNumber: p.manfr_part_num,
        name: p.name,
        partId: p.id,
        _key: p.id.toString()
    };
    add_part(part);
})



