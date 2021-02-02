// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

let where_used_model = require('../models/where_used');


function _filter_headers(where_useds) {
    return where_useds.filter(used => (used.type !== 'header' && used.type !== 'Created'))
}

function  dto_parts(where_useds) {
    let filtered = _filter_headers(where_useds);
    return filtered.map((p) => {
        return {
            partId: parseInt(p.partId),
            relationDistance: p.relationDistance,
            relationType: p.relationType
        }
    })
}

function findWhereUsed (req, res) {
    where_used_model.findWhereUsed([req.params.id], 5).then(
        function (where_used) {
	    res.set('Connection', 'close');
            res.json(dto_parts(where_used));
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findWhereUsed = findWhereUsed;


