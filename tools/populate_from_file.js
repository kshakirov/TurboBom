var fs = require('fs');
var part_model = require('../models/part');
var bom_model = require('../models/bom');
var interchanges_model = require('../models/interchanges');

const uuidv1 = require('uuid/v1');

var data = fs.readFileSync('../metadata_arangodb_interchanges.json');

function add_part(part) {
    part_model.addPart(part)
}

function add_boms(boms, parent_id) {
    if (boms.length > 0) {
        for (key in boms) {
            var child_id = boms[key].id,
                quantity = boms[key].quantity;
            bom_model.addBom(parent_id, child_id, quantity)

        }
    }
}


function _get_interchanges_ids(interchanges) {
    return interchanges.map(function (id) {
        return id;
    })
}

function _create_interchanges_sub_graph(ids, part_id, header_id) {

        var actions = ids.map(function (id) {
            return interchanges_model.addInterchange(header_id, id);
        })
        return Promise.all(actions).then(function (promise) {
            console.log(`Interchange Edge Added Header [${header_id}]`)
        })

}


function add_interchanges(interchanges, part_id) {
    var header_id = interchanges.header_id;
    if (interchanges.members.length > 0) {
        var ids = _get_interchanges_ids(interchanges.members);
        ids.push(part_id);
        return interchanges_model.addInterchangeHeader(header_id).then(function () {
            return _create_interchanges_sub_graph(ids, part_id, header_id);
        }, function (error) {
            return false;
        })
    } else {
        return interchanges_model.addInterchangeHeader(header_id).then(function (promise) {
            return interchanges_model.addInterchange(header_id, part_id).then(function (promise) {
                return true;
            });
        })
    }
}

parts = JSON.parse(data);
for (key  in parts) {
    var p = parts[key];
    var part = {
        manufacturer: p.manufacturer.name,
        description: p.description,
        part_type: p.part_type.name,
        name: p.name,
        _key: p.id.toString()
    };
    //add_part(part);
    // add_boms(p.boms, p.id)
    add_interchanges(p.interchanges, part._key);
    console.log("Added Part " + part._key)
}

