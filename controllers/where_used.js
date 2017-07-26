// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

var where_used_model = require('../models/where_used')

function findWhereUsed (req, res) {
    where_used_model.findWhereUsed(req.params.id).then(
        function (where_used) {
            res.json(where_used);
        },
        function (err) {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findWhereUsed = findWhereUsed

