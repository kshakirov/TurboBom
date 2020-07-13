let interchange_model = require('../models/interchanges');
const interchangeLog = require('../models/interchange-log');

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
    interchange_model.removeInterchange(req.params.header_id, req.params.item_id).then(
        function () {
            interchangeLog.log(req.params.item_id, req.params.header_id, 'leave').then(data => {
                response.description = data[0].description;
                response.transactionId = data[0].transactionId;
                response.success = true;
                res.json(response);
            });
        },
        function (err) {
            res.json({'success': true, 'msg': err.message});
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
                interchangeLog.log(req.params.item_id, null, new_header_id, 'create').then(data => {
                    response.description = data[0].description;
                    response.transactionId = data[0].transactionId;
                    res.json(response);
                });
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
            interchangeLog.log(req.params.item_id, null, req.params.header_id, 'add').then(data => {
                response.description = data[0].description;
                response.transactionId = data[0].transactionId;
                res.json(response);
            });
        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            res.json(response);
        }
    );
}


async function leaveIntechangeGroup(req, res) {
    let response = {success: true};
    return interchange_model.findInterchangeHeaderByItemId(req.params.item_id).then(
        function (header_promise) {
            let old_header_id = header_promise[0].key;
            return interchange_model.leaveInterchangeGroup(req.params.item_id).then(function (promise) {
                    response.newHeaderId = parseInt(promise);
                    response.oldHeaderId = parseInt(old_header_id);
                    interchangeLog.log(req.params.item_id, old_header_id, promise, 'leave').then(data => {
                        response.description = data[0].description;
                        response.transactionId = data[0].transactionId;
                        res.json(response);
                    });

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
                interchangeLog.log(req.params.out_item_id, old_header_id, promises[0][0].key, 'add').then(data => {
                    response.description = data[0].description;
                    response.transactionId = data[0].transactionId;
                    res.json(response);
                });
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
            let ids = new Set();
            ids.add(parseInt(req.params.item_id));
            ids.add(parseInt(req.params.picked_id));
            interchange_model.findInterchange(req.params.item_id).then(function (interchanges) {
                interchanges.forEach(function (interchange) {
                    ids.add(interchange.partId);
                });
                interchange_model.findInterchange(req.params.picked_id).then(function (interchanges) {
                    interchanges.forEach(function (interchange) {
                        ids.add(interchange.partId);
                    });
                    return interchange_model.mergeItemGroupToAnotherItemGroup(req.params.item_id,
                        req.params.picked_id).then(function (promise) {
                        return interchange_model.findInterchangeHeaderByItemId(req.params.item_id).then(
                            function (promise) {
                                response.newHeaderId = dto_header_key(promise[0]);
                                response.oldHeaderId = parseInt(old_header_id);
                                interchangeLog.logGroup(Array.from(ids), old_header_id, dto_header_key(promise[0]), 'addGroup').then(data => {
                                    response.description = data[0].description;
                                    response.transactionId = data[0].transactionId;
                                    res.json(response);
                                });
                            });
                    })
                })
            })

        })
}


exports.findInterchange = findInterchange;
exports.removeInterchange = removeInterchange;
exports.addInterchange = addInterchange;
exports.addInterchangeToGroup = addInterchangeToGroup;
exports.createInterchange = createInterchange;
exports.leaveIntechangeGroup = leaveIntechangeGroup;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.mergeIterchangeToAnotherItemGroup = mergeIterchangeToAnotherItemGroup;
