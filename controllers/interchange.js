let interchange_model = require('../models/interchanges');


function dto_header_key(promise) {
    if (promise && promise.key)
        return parseInt(promise.key);
    else
        return null;
}


function dto_parts(parts) {
    return parts.map((p) => {
        return {
            sku: parseInt(p.partId),
            attributes: p.attributes

        };
    })
}

function findInterchange(req, res) {
    let actions = [];
    actions.push(interchange_model.findInterchangeHeaderByItemId(req.params.id));
    actions.push(interchange_model.findInterchange(req.params.id));
    Promise.all(actions).then(
        function (promises) {
            let response = {
                headerId: dto_header_key(promises[0][0]),
                parts: dto_parts(promises[1])
            };
            res.set('Connection', 'close');
            res.json(response);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


function dto_cassandra(response){
    return response.map(r =>{
        return {
            id: r._key,
            manufacturer: r.attributes.manufacturer,
            partType: r.attributes.part_type,
            part_number:r.attributes.part_number,
            inactive: false
        }
    })
}

function _findInterchangeCassandra(id) {
    return interchange_model.findInterchange(id).then(
        response => {
            return dto_cassandra(response);
        },
        err => {
            return false;
        }
    );
}


function findInterchangeCassandra(req, res) {
    return _findInterchangeCassandra(req.params.id).then(
        result => {
            if(result){
                res.set('Connection', 'close');
                res.json(result);
            }else{
                res.send("There was a problem finding interchange ");
            }
        });
}


function findInterchangesByHeaderId(req, res) {
    interchange_model.findInterchangesByHeaderId(req.params.header_id).then(
        function (interchanges) {
            let response = {
                headerId: parseInt(req.params.header_id),
                parts: dto_parts(interchanges)
            };
            res.set('Connection', 'close');
            res.json(response);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

function removeInterchange(req, res) {
    let response = {success: true};
    interchange_model.removeInterchange(req.params.header_id, req.params.item_id).then(
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


function createInterchange(req, res) {
    let response = {success: true};
    return interchange_model.createInterchangeHeader().then(function (promise) {
        let new_header_id = promise;
        return interchange_model.addInterchange(new_header_id, req.params.item_id).then(
            function () {
                response.headerId = parseInt(new_header_id);
                res.json(response);
            },
            function (err) {
                response.success = false;
                response.msg = err.message;
                res.json(response);
            }
        );
    })
}


function addInterchange(req, res) {
    let response = {success: true};
    interchange_model.addInterchange(req.params.header_id, req.params.item_id).then(
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


function leaveIntechangeGroup(req, res) {
    let response = {success: true};
    return interchange_model.findInterchangeHeaderByItemId(req.params.item_id).then(
        function (header_promise) {
            let old_header_id = header_promise[0].key;
            return interchange_model.leaveInterchangeGroup(req.params.item_id).then(function (promise) {
                    response.newHeaderId = parseInt(promise);
                    response.oldHeaderId = parseInt(old_header_id);
                    res.json(response);
                },
                function (err) {
                    response.success = false;
                    response.msg = err.message;
                    res.json(response);
                }
            )
        })
}


function addInterchangeToGroup(req, res) {
    let response = {success: true};
    let actions = [];
    return interchange_model.findInterchangeHeaderByItemId(req.params.out_item_id).then(function (header_promise) {
        let old_header_id = header_promise[0].key;
        actions.push(interchange_model.findInterchangeHeaderByItemId(req.params.in_item_id));
        actions.push(interchange_model.addInterchangeToGroup(req.params.in_item_id,
            req.params.out_item_id));
        Promise.all(actions).then(
            function (promises) {
                response.newHeaderId = parseInt(promises[0][0].key);
                response.oldHeaderId = parseInt(old_header_id);
                res.json(response);
            },
            function (err) {
                response.success = false;
                response.msg = err.message;
                res.json(response);
            }
        );
    })
}


function mergeIterchangeToAnotherItemGroup(req, res) {
    let response = {success: true};
    return interchange_model.findInterchangeHeaderByItemId(req.params.picked_id).then(
        function (header_promise) {
            let old_header_id = header_promise[0].key;
            return interchange_model.mergeItemGroupToAnotherItemGroup(req.params.item_id,
                req.params.picked_id).then(function (promise) {
                return interchange_model.findInterchangeHeaderByItemId(req.params.item_id).then(
                    function (promise) {
                        response.newHeaderId = dto_header_key(promise[0]);
                        response.oldHeaderId = parseInt(old_header_id);
                        res.json(response);
                    });
                res.son(response);
            })
        })
}


exports.findInterchange = findInterchange;
exports.testFindInterchange = _findInterchangeCassandra;
exports.findInterchangeCassandra = findInterchangeCassandra;
exports.removeInterchange = removeInterchange;
exports.addInterchange = addInterchange;
exports.addInterchangeToGroup = addInterchangeToGroup;
exports.createInterchange = createInterchange;
exports.leaveIntechangeGroup = leaveIntechangeGroup;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.mergeIterchangeToAnotherItemGroup = mergeIterchangeToAnotherItemGroup;
