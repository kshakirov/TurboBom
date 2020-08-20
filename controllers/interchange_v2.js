let interchange_model = require('../models/interchanges_v2');

function dto_header_key(promise) {
    if (promise && promise.key)
        return parseInt(promise.key);
    else
        return null;
}

function dto_parts(parts) {
    return parts.filter(it => it != null).map((p) => {
        return parseInt(p.partId)
    })
}

async function findInterchange(req, res) {
    try {
        let header = await interchange_model.findInterchangeHeaderByItemId(req.params.id);
        let interchange = await interchange_model.findInterchange(req.params.id);
        let response = {
            headerId: dto_header_key(header[0]),
            parts: dto_parts(interchange)
        };
        res.set('Connection', 'close');
        res.json(response);
    } catch(e) {
        res.send("There was a problem adding the information to the database. ");
    }
}

async function findInterchangesByHeaderId(req, res) {
    try {
        let interchanges = await interchange_model.findInterchangesByHeaderId(req.params.header_id);
        let response = {
            headerId: parseInt(req.params.header_id),
            parts: [{"id":8389,"manufacturer":"Garrett","partType":"Turbo","description":null,"part_number":"709838-0003","inactive":false}]// dto_parts(interchanges)
        };
        res.set('Connection', 'close');
        res.json(response);
    } catch(e) {
        res.send("There was a problem adding the information to the database. " + err);
    }
}

exports.findInterchange = findInterchange;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;