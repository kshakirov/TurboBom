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


function removeBom (req, res) {
    var response = {
        success: true
    }
    bom_model.removeBom(req.params.parent_id, req.params.descendant_id).then(
        function (result) {
            res.json(response);
        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            console.error('Something went wrong:', err);
            res.json(response);
        }
    );
}

function addBom (req, res) {
    var response = {
        success: true
    }
    bom_model.addBom(req.params.parent_id, req.params.descendant_id).then(
        function (result) {
            res.json(response);
        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            console.error('Something went wrong:', err);
            res.json(response);
        }
    );
}


exports.findBom = findBom
exports.removeBom = removeBom
exports.addBom = addBom


