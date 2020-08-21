let interchangeModel = require('../models/interchanges_v2');

let findInterchange = async (req, res) => {
    try {
        res.set('Connection', 'close');
        res.json({
            headerId: (await interchangeModel.findInterchangeHeaderByItemId(req.params.id))[0].key,
            parts: await interchangeModel.findInterchange(req.params.id)
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

let convertPartForEcommerce = (part) => ({
    'id': part.sku,
    'manufacturer': part.manufacturer,
    'partType': part.partType,
    'description': part.description,
    'part_number': part.partNumber,
    'inactive': false
});

let findInterchangeEcommerce = async (req, res) => {
    try {
        res.set('Connection', 'close');
        res.json({
            headerId: (await interchangeModel.findInterchangeHeaderByItemId(req.params.id))[0].key,
            parts: (await interchangeModel.findInterchange(req.params.id)).map(it => convertPartForEcommerce(it))
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
};

let findInterchangesPage = async (req, res) => {
    try {
        res.set('Connection', 'close');
        res.json({
            headerId: (await interchangeModel.findInterchangeHeaderByItemId(req.params.id))[0].key,
            parts: await interchangeModel.findInterchangesPage(req.params.id, req.params.offset, req.params.limit)
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

let findInterchangesByHeaderId = async (req, res) => {
    try {
        res.set('Connection', 'close');
        res.json({
            headerId: parseInt(req.params.header_id),
            parts: await interchangeModel.findInterchangesByHeaderId(req.params.header_id)
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

exports.findInterchange = findInterchange;
exports.findInterchangeEcommerce = findInterchangeEcommerce;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.findInterchangesPage = findInterchangesPage;