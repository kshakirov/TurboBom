let part_model = require('../models/part'),
    interchange_model = require('../models/interchanges');

function _create_product(body, id) {
    return {
        _key: id.toString(),
        manufacturerId: body.manufacturerId,
        partTypeId: body.partTypeId,
        partId: id,
    };
}

function _create_part(part) {
    return {
        _key: part.id,
        partTypeId: part.partTypeId, //TODO remove later
        partId: part.sku,
        sku: part.sku,
        attributes: part.attributes
    };
}


function smart_create_part(part) {
    let part_body = {
        _key: part.sku.toString(),
        sku: part.sku,
        partId: part.sku,
        attributes: part.attributes
    };
    if (part.hasOwnProperty('partTypeId')) {
        part_body['partTypeId'] = part.partTypeId;
    }
    return part_body
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
            res.json(response);
        }
    );
}

function addPart(req, res) {
    let response = {
        success: true,
    };
    let product = _create_product(req.body, req.params.id);
    return part_model.addPart(product).then(
        () => {
            interchange_model.createInterchangeHeader().then((header_id) => {
                interchange_model.addInterchange(header_id, req.params.id).then((r) => {
                    response.headerId = header_id;
                    res.json(response);
                })
            });

        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            res.json(response);
        }
    );
}


function getPart(req, res) {
    let id = req.params.id;
    part_model.getPart(id).then((part) => {
        res.json(part);
    }, (error) => {
        res.sendStatus(404);
    })
}

function part(id) {
    return part_model.getPart(id).then((part) => {
        return part;
    }, (error) => {
        return false;
    })
}

function upsertPart(req, res) {
    let response = {
        success: true
    };
    let parts = req.body.map(p => _create_part(p));
    parts.forEach(part => {
        let id = part.partId.toString();
        part_model.getPart(id).then(() => {
            part_model.updatePart(id, part).then(
                p => {
                    res.json(response);
                },
                err => {
                    response.success = false;
                    response.msg = err.message;
                    res.json(response);
                }
            );
        }, (error) => {
            return part_model.addPart(part).then(
                () => {
                    interchange_model.createInterchangeHeader().then((header_id) => {
                        interchange_model.addInterchange(header_id, id).then((r) => {
                            response.headerId = header_id;
                            res.json(response);
                        })
                    });
                },
                err => {
                    response.success = false;
                    response.msg = err.message;
                    res.json(response);
                }
            );
        });
    });

}

function updateBulk(req, res) {
    let parts = req.body.map(p => smart_create_part(p));
    part_model.addBulk(parts).then((part) => {
        res.sendStatus(200);
    }, (error) => {
        res.sendStatus(404);
    })
}


exports.removePart = removePart;
exports.addPart = addPart;
exports.getPart = getPart;
exports.part = part;
exports.upsertPart = upsertPart;
exports.updateBulk = updateBulk;

