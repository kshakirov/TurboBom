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
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findInterchange = findInterchange