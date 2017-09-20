let part_model = require('../models/part')

function _create_product(body, id) {
    return {
        _key: id.toString(),
        manufacturerId: body.manufacturerId,
        partTypeId: body.partTypeId,
    };
}


function removePart(req, res) {
    let response = {
        success: true
    };
    part_model.removePart(req.params.id).then(
        function () {
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
    let response = {
        success: true,
    };
    let product = _create_product(req.body,  req.params.id);
    return part_model.addPart(product).then(
        function () {
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
    let response = {
        success: true
    };
    let product = _create_product(req.body);
    part_model.updatePart(req.params.id, product).then(
        function () {
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


exports.removePart = removePart;
exports.addPart = addPart;
exports.updatePart = updatePart;
