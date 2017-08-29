// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

var where_used_model = require('../models/where_used')


function _filter_headers(where_useds) {
    return where_useds.filter(used => used.type != 'header')
}


function findWhereUsed (req, res) {
    where_used_model.findWhereUsed([req.params.id], []).then(
        function (where_used) {
            res.json(_filter_headers(where_used));
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findWhereUsed = findWhereUsed


