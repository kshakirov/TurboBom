let fs = require('fs'),
    part_model = require('../models/part'),
    config = require('config'),
    dbConfig = config.get('TurboGraph.dbConfig');


function add_part(part) {
    part_model.addPart(part).then(s => {
        console.log(`Adding Part [${part._key}]`);
    }, e => {
        console.log(e.message);
    });
}

let data = fs.readFileSync(dbConfig.dumpFile);
parts = JSON.parse(data);
parts.map(function (p) {

    let part = {
        manufacturerId: p.manufacturer.id,
        partTypeId: p.part_type.id,
        partId: p.id,
        _key: p.id.toString()
    };
    console.log(`Reading Part [${part._key}]`);
    add_part(part);
});



