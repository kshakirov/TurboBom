let client = require('node-rest-client-promise').Client(),
    config = require('config'),
    metadata = config.get('TurboGraph.metadata');


function find_sales_notes(req, res) {
    let url = `http://${metadata.host}:${metadata.port}/product/${req.params.id}/sales_notes/`;
    return client.getPromise(url).then(response => {
            res.set('Connection', 'close');
            res.json(response.data);
        },
        err => {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );

}


exports.findSalesNotes = find_sales_notes;
