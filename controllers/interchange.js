var interchange_model = require('../models/interchanges')
const uuidv1 = require('uuid/v1');


function dto_header_key(promise) {
    return promise.key.replace('header_', '')
}

function findInterchange(req, res) {
    interchange_model.findInterchange(req.params.id).then(
        function (interchanges) {
            var response = {
                id: req.params.id,
                parts: interchanges.map(function (interchange) {
                    return interchange.id;
                })
            }
            res.json(response);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

function removeInterchange(req, res) {
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


function createInterchange(req, res) {
    var response = {
        success: true
    }
    var new_header = uuidv1();
    return interchange_model.addInterchangeHeader(new_header).then(function () {
        return interchange_model.addInterchange(new_header, req.item_id).then(
            function (result) {
                response.header_id = new_header;
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



function leaveIntechangeGroup(req, res) {
    var response = {
        success: true
    }
    return interchange_model.leaveInterchangeGroup(req.params.item_id).then(function (promise) {
            response.header_id = promise;
            res.json(response);
        },
        function (err) {
            response.success = false;
            response.msg = err.message;
            res.json(response);
        }
    )
}


function addInterchangeToGroup(req, res) {
    var response = {
        success: true
    }
    interchange_model.addInterchangeToGroup(req.params.in_item_id, req.params.out_item_id).then(
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


function mergeIterchangeToAnotherItemGroup(req, res) {
    var response = {
        success: true
    };
    return interchange_model.mergeItemGroupToAnotherItemGroup(req.params.item_id,
        req.params.picked_id).then(function (promise) {
        return interchange_model.findInterchangeHeaderByItemId(req.params.item_id).then(
            function (promise) {
                response.header_id =dto_header_key(promise[0]);
                res.json(response);
            },
            function (err) {
                response.success = false;
                response.msg = err.message;
                res.json(response);
            })
        res.json(response);
    }, function (err) {
        response.success = false;
        response.msg = err.message;
        res.json(response);
    })
}


exports.findInterchange = findInterchange;
exports.removeInterchange = removeInterchange;
exports.addInterchange = addInterchange;
exports.addInterchangeToGroup = addInterchangeToGroup;
exports.createInterchange = createInterchange;
exports.leaveIntechangeGroup = leaveIntechangeGroup;
exports.mergeIterchangeToAnotherItemGroup = mergeIterchangeToAnotherItemGroup;
