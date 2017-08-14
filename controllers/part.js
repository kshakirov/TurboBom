var part_model = require('../models/part')

function _create_product(body) {
    return {
        _key: body.id.toString(),
        part_number: body.part_number,
        name: body.name,
        part_type: body.part_type,
        description: body.description
    };
}


function removePart(req, res) {
    var response = {
        success: true
    }
    part_model.removePart(req.params.id).then(
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

function addPart(req, res) {
    var response = {
        success: true,
    }
    var product = _create_product(req.body);
    return part_model.addPart(product).then(
        function (result) {
            res.json(response);
        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            res.json(response);
        }
    );
}

function updatePart(req, res) {
    var response = {
        success: true
    }
    var product = _create_product(req.body);
    part_model.updatePart(req.params.id, product).then(
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


exports.removePart = removePart
exports.addPart = addPart
exports.updatePart = updatePart
