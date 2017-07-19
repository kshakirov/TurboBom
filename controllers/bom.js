// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

var bom_model = require('../models/bom')

function findBom (req, res) {
    bom_model.findBom(req.params.id).then(
        function (bom) {
            res.json(bom);
        },
        function (err) {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findBom = findBom


