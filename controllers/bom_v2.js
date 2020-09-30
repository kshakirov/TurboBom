let bomModel = require('../models/bom_v2');
let tokenTools = require('../tools/token_tools');

let filterDirectBoms = (boms) => boms.filter(bom => bom.nodeType === 'direct');

let getInterchanges = (d_boms, boms) => d_boms.map(db => {
    db.interchanges = boms.filter(b => b.bomPartId == db.partId).map((i) => parseInt(i.partId));
    return db
});

let filterBoms = (boms) => getInterchanges(filterDirectBoms(boms), boms);

let findBom = async (req, res) => res.json(filterBoms(await bomModel.findBom(req.params.id, parseInt(req.query.distance) || 1, req.query.depth || 5)));

let getDirectDesc = (boms) => boms.filter(b => b.nodeType === 'direct');

let getInterchangePartNumber = (i) => i.hasOwnProperty('part_number') && i.part_number != null ? i.part_number : null;

let getInterchangeManufacturer = (i) => i.hasOwnProperty('manufacturer') && i.manufacturer != null ? i.manufacturer : null;

let getInterchangePrice = (i) => i.hasOwnProperty('prices') && i.prices != null ? i.prices : null;

let getInterchangesCassandra = (dBoms, boms) => {
    return dBoms.map(db => {
        db.interchanges = boms.filter(b => b.bomPartId == db.sku);
        db.interchanges = db.interchanges.map((i) => {
            return {
                sku: parseInt(i.sku),
                part_number: getInterchangePartNumber(i),
                manufacturer: getInterchangeManufacturer(i),
                prices: getInterchangePrice(i)
            };
        });
        return db;
    });
}


let filterBomsCassandra = (boms) => {
    let filteredBoms =
        boms.filter(bom => bom.type != 'header')
            .map(b => {
        b.sku = parseInt(b.sku);
        return b;
    });
    let directDesc = getDirectDesc(filteredBoms);
    filteredBoms = getInterchangesCassandra(directDesc, filteredBoms);
    return filteredBoms;
}

let hidePrices = (data) => data.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (data, user_data) =>
    data.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group];
        }
        return b;
    })

let addPrice = (data, authorization) => {
    let token = tokenTools.getToken(authorization);
    if (token) {
        let userData = tokenTools.verifyToken(token);
        if(userData) {
            return flattenPrice(data, userData);
        }
    }
    return hidePrices(data);
}

let _findBomEcommerce = async (id, distance, authorization) => {
    try {
        let bom = await bomModel.findBomCassandra(id, distance);
        boms = filterBomsCassandra(bom);
        boms.forEach(it => {
            it['oe_sku'] = it['sku'];
            it['sku'] = it['sku'];
            it['oe_part_number'] = it['part_number'];
            it['oe_part_number'] = null;
            it['distance'] = it['relationDistance'];
            delete it['relationDistance'];
        });
        addPrice(boms, authorization);
        return boms;
    } catch(e) {
        console.log(e);
    }
}

let findBomEcommerce = async (req, res) => {
    try {
        let distance = parseInt(req.query.distance) || 4,
            id = req.params.id;
        res.json((await _findBomEcommerce(id, distance, req.headers.authorization)));
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

let findBomPage = async (req, res) => res.json(filterBoms(await bomModel.findBomPage(req.params.offset, req.params.limit, req.params.id, parseInt(req.query.distance) || 1, req.query.depth || 5)));

let findOnlyBom = async (req, res) => res.json((await bomModel.findOnlyBom(req.params.id)));

let convertToVertice = (response) => response.map((r) => {
    let bom = r.vertice;
    bom.qty = r.edge.quantity;
    return bom
})
let findBomAsChild = async (req, res) => res.json(convertToVertice((await bomModel.findBomAsChild(req.params.id))));

let removeBom = async (req, res) => {
    try {
        await bomModel.removeBom(req.params.parent_id, req.params.descendant_id);
        res.json({
            success: true
        });
    } catch(e) {
        res.json({
            success: false
        });
    }
}

let updateBom = async (req, res) => {
    await bomModel.updateBom(req.params.parent_id, req.params.descendant_id, req.body.qty);
    res.json({
        success: true
    });
}

let addBom = async (req, res) => {
    let response = {
        success: true
    };
    try {
        await bomModel.addBom(req.params.parent_id, req.params.descendant_id, req.body.qty);
    } catch(e) {
        response.success = false;
        response.msg = e.message;
    }
    res.json(response);
}

exports.findBom = findBom;
exports.findBomEcommerce = findBomEcommerce;
exports._findBomEcommerce = _findBomEcommerce;
exports.findBomPage = findBomPage;
exports.findOnlyBom = findOnlyBom;
exports.findBomAsChild = findBomAsChild;
exports.removeBom = removeBom;
exports.updateBom = updateBom;
exports.addBom = addBom;
exports.filterBoms = filterBoms;