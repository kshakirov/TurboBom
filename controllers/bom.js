// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

let bom_model = require('../models/bom');


function get_direct_desc(boms) {
    return boms.filter(function (b) {
        if (b.nodeType === 'direct')
            return b
    });
}

function get_interchanges(d_boms, boms) {
    return d_boms.map(function (db) {
        db.interchanges = boms.filter(function (b) {
            if (b.bomPartId == db.partId)
                return b
        });
        db.interchanges = db.interchanges.map((i) => {
            return {
                id: parseInt(i.partId),
                attributes: i.attributes
            }
        });
        return db
    });
    //return ib
}

function get_interchange_part_number(i) {
    if(i.hasOwnProperty('part_number') && i.part_number !=null){
        return  i.part_number
    }
    return null;
}

function get_interchange_manufacturer(i) {
    if(i.hasOwnProperty('manufacturer') && i.manufacturer !=null){
        return  i.manufacturer
    }
    return null;
}

function get_interchanges_cassandra(d_boms, boms) {
    return d_boms.map(function (db) {
        db.interchanges = boms.filter(function (b) {
            if (b.bomPartId == db.sku)
                return b
        });
        db.interchanges = db.interchanges.map((i) => {
            return {
                sku: parseInt(i.sku),
                part_number: get_interchange_part_number(i),
                manufacturer: get_interchange_manufacturer(i)
            }
        });
        return db
    });
    //return ib
}

function filter_boms(boms) {
    let filtered_boms = boms.filter(function (bom) {
        if (bom.type != 'header')
            return bom;
    });
    filtered_boms = filtered_boms.map(b => {
        b.partId = parseInt(b.partId);
        return b
    });
    let direct_desc = get_direct_desc(filtered_boms);
    filtered_boms = get_interchanges(direct_desc, filtered_boms);
    return filtered_boms;
}


function filter_boms_cassandra(boms) {
    let filtered_boms = boms.filter(function (bom) {
        if (bom.type != 'header')
            return bom;
    });
    filtered_boms = filtered_boms.map(b => {
        b.sku = parseInt(b.sku);
        return b
    });
    let direct_desc = get_direct_desc(filtered_boms);
    filtered_boms = get_interchanges_cassandra(direct_desc, filtered_boms);
    return filtered_boms;
}

function get_qty(body) {
    return body.qty;
}

function merge_edges_vertices(response) {
    return response.map((r) => {
        let bom = r.vertice;
        bom.qty = r.edge.quantity;
        return bom
    })
}


function findBom(req, res) {

    let depth = req.query.depth || 40,
        distance = parseInt(req.query.distance) || 1;
    bom_model.findBom(req.params.id, distance, depth).then(
        function (bom) {
            let fb = filter_boms(bom);
            res.set('Connection', 'close');
            res.json(fb);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


function _findBomCassandra(id, distance,depth) {
    return bom_model.findBomCassandra(id, distance, depth).then(
        bom =>  {
            return  filter_boms_cassandra(bom);

        },
        function (err) {
            console.log(err)
        }
    );
}


function findBomCassandra(req, res) {

    let depth = req.query.depth || 40,
        distance = parseInt(req.query.distance) || 1,
        id = req.params.id;
    _findBomCassandra(id, distance,depth).then(r =>{
             res.set('Connection', 'close');
             res.json(r);
         }, err => {
             res.send("There was a problem adding the information to the database. " + err);
         })
}

function findOnlyBom(req, res) {
    bom_model.findOnlyBom(req.params.id).then(
        function (bom) {
            res.set('Connection', 'close');
            res.json(bom);
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


function findBomAsChild(req, res) {
    bom_model.findBomAsChild(req.params.id).then(
        function (response) {
            res.set('Connection', 'close');
            res.json(merge_edges_vertices(response));
        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


function removeBom(req, res) {
    let response = {
        success: true
    };
    bom_model.removeBom(req.params.parent_id, req.params.descendant_id).then(
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

function addBom(req, res) {
    let response = {
        success: true
    };
    let qty = get_qty(req.body);
    bom_model.addBom(req.params.parent_id, req.params.descendant_id, qty).then(
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


function updateBom(req, res) {
    let response = {
        success: true
    };
    let qty = get_qty(req.body);
    bom_model.updateBom(req.params.parent_id, req.params.descendant_id, qty).then(
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


exports.findBom = findBom;
exports.findBomCassandra = findBomCassandra;
exports.findBomCassandraTest = _findBomCassandra;
exports.findOnlyBom = findOnlyBom;
exports.findBomAsChild = findBomAsChild;
exports.removeBom = removeBom;
exports.addBom = addBom;
exports.updateBom = updateBom;


