var interchange_model = require('../models/interchanges')

function findInterchange (req, res) {
    interchange_model.findInterchange(req.params.id).then(
        function (interchanges) {
            var response = {
                id: req.params.id,
                parts :  interchanges
            }
            res.json(response);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}
function removeInterchange (req, res) {
    var response = {
        success: true
    }
    interchange_model.removeInterchange(req.params.header_id, req.params.item_id).then(
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

function addInterchange (req, res) {
    var response = {
        success: true
    }
    interchange_model.addInterchange(req.params.header_id, req.params.item_id).then(
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



exports.findInterchange = findInterchange
exports.removeInterchange = removeInterchange
exports.addInterchange = addInterchange