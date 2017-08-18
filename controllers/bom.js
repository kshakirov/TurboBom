// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

var bom_model = require('../models/bom')



function get_direct_desc(boms) {
    var dd = boms.filter(function (b) {
        if(b.nodeType=='direct')
            return b
    })
    return dd
}

function get_interchanges(d_boms, boms) {
    var ib = d_boms.map(function (db) {
        db.interchanges = boms.filter(function (b) {
            if(b.bomPartId==db.partId)
                return b
        })
        return db
    })
    return ib
}

function filter_boms(boms) {
    var filtered_boms = boms.filter(function (bom) {
        if(bom.type!='header')
            return bom;
    })
    var direct_desc = get_direct_desc(filtered_boms);
    filtered_boms = get_interchanges(direct_desc, filtered_boms)
    return filtered_boms;
}



function findBom (req, res) {
    bom_model.findBom(req.params.id).then(
        function (bom) {
            var fb = filter_boms(bom)
            res.json(fb);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

function findBomAsChild (req, res) {
    bom_model.findBomAsChild(req.params.id).then(
        function (bom) {
            res.json(bom);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


function removeBom (req, res) {
    var response = {
        success: true
    }
    bom_model.removeBom(req.params.parent_id, req.params.descendant_id).then(
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

function addBom (req, res) {
    var response = {
        success: true
    }
    bom_model.addBom(req.params.parent_id, req.params.descendant_id).then(
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


exports.findBom = findBom
exports.findBomAsChild = findBomAsChild
exports.removeBom = removeBom
exports.addBom = addBom


