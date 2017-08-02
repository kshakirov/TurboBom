var part_model = require('../models/part')


function removePart (req, res) {
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

function addPart (req, res) {
    var response = {
        success: true
    }
    part_model.addPart(req.params.product).then(
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

function updatePart (req, res) {
    var response = {
        success: true
    }
    part_model.updatePart(req.params.product).then(
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