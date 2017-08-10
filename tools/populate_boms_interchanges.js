var fs = require('fs');
var bom_model = require('../models/bom');
var interchanges_model = require('../models/interchanges');
const uuidv1 = require('uuid/v1');

function add_boms(boms, parent_id) {
    console.log(`Adding Bom To [${parent_id}]`)
    if (boms.length > 0) {
        for (key in boms) {
            var child_id = boms[key].child.id,
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
    ids.map(function (id) {
        interchanges_model.addInterchange(header_id, id);
    })
}

function add_interchanges(interchanges, part_id) {
    console.log(`Adding  Interchange To  [${part_id}]`);
    var header_id = interchanges.header_id;
    if (interchanges.members.length > 0) {
        var ids = _get_interchanges_ids(interchanges.members);
        ids.push(part_id);
        return interchanges_model.addInterchangeHeader(header_id).then(function () {
            _create_interchanges_sub_graph(ids, part_id, header_id);
        }, function (error) {
            return false;
        })
    } else {
        return interchanges_model.addInterchangeHeader(header_id).then(function (promise) {
            interchanges_model.addInterchange(header_id, part_id);
        })
    }
}

var data = fs.readFileSync('../metadata_arangodb_interchanges.json');
parts = JSON.parse(data);

parts.map(function (part) {
    add_boms(part.boms, part.id);
    add_interchanges(part.interchanges, part.id);
})


