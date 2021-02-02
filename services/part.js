let part_model = require('../models/part'),
    interchange_model = require('../models/interchanges');

function _create_product(body, id) {
    return {
        _key: id.toString(),
        manufacturerId: body.manufacturerId,
        partTypeId: body.partTypeId,
        partId: id
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
    let product = _create_product(req.body, req.params.id);
    console.log(new Date() + 'addPart, created product: ' + JSON.stringify(product));
    return part_model.addPart(product).then(
        () => {
            console.log(new Date() + 'part_model.addPart succesfully executed: ' + JSON.stringify(product));
            interchange_model.createInterchangeHeader().then((header_id) => {
                console.log(new Date() + 'header created: ' + header_id);
                interchange_model.addInterchange(header_id, req.params.id).then((r) => {
                    console.log(new Date() + 'interchange added to header: ' + header_id + ' ' + req.params.id);
                    response.headerId = header_id;
                    res.json(response);
                })
            });

        },
        function (err) {
            console.error(new Date() + 'part_model.addPart error: ' + err);
            response.success = false;
            response.msg = err.message;
            res.json(response);
        }
    );
}


function getPart(req,res) {
    let id = req.params.id;
    part_model.getPart(id).then((part)=>{
        res.json(part);
    }, (error) =>{
        res.sendStatus(404);
    })
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
exports.getPart = getPart;
exports.updatePart = updatePart;
