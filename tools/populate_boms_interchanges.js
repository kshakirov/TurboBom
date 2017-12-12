let fs = require('fs'),
    bom_model = require('../models/bom'),
    interchanges_model = require('../models/interchanges'),
    config = require('config'),
    dbConfig = config.get('TurboGraph.dbConfig');

function add_boms(boms, parent_id) {
    console.log(`Reading   Bom To Part  [${parent_id}]`);
    boms.map(function (bom) {
        let child_id = bom.child.id.toString(),
            quantity = bom.quantity.toString();
        bom_model.addBom(parent_id.toString(), child_id, quantity).then(s => {
            console.log(`Adding [${child_id}] As  Bom To [${parent_id}]`);
        }, e => {
            console.log(e.message);
        })
    })
}


function _get_interchanges_ids(interchanges) {
    return interchanges.map(function (id) {
        return id;
    })
}

function _create_interchanges_sub_graph(ids, part_id, header_id) {
    ids.map(function (id) {
        interchanges_model.addInterchange(header_id, id).then(s => {
            console.log(`Adding  Part [${id}] as    Interchange To Header  [${header_id}]`);
        }, e => {
            console.log(e.message);
        })
    })
}

function add_interchanges(interchanges, part_id) {
    console.log(`Reading   Interchange To Part  [${part_id}]`);
    let header_id = interchanges.header_id;
    if (interchanges.members.length > 0) {
        let ids = _get_interchanges_ids(interchanges.members);
        ids.push(part_id);
        return interchanges_model.addInterchangeHeader(header_id).then(function () {
            _create_interchanges_sub_graph(ids, part_id, header_id);
        }, function (error) {
            if (error.code == 409) {

            } else {
                console.log(`Problems Adding Header [ ${header_id}] For Part [${part_id}]`);
                console.log(error.message);
                console.log(error.errorNum);
            }
            return false;
        })
    } else {
        return interchanges_model.addInterchangeHeader(header_id).then(function (promise) {
            interchanges_model.addInterchange(header_id, part_id).then(s => {
                console.log(`Adding  Part [${part_id}] as    Interchange To Header  [${header_id}]`);
            }, e => {
                console.log(error.message);
            });
        }, function (error) {
            console.log(error.message);
            console.log(`Problems Adding Header [ ${header_id}] For Part [${part_id}]`);
        })
    }
}

let data = fs.readFileSync(dbConfig.dumpFile);
parts = JSON.parse(data);

parts.map(function (part) {
    add_boms(part.boms, part.id);
    add_interchanges(part.interchanges, part.id);
});


