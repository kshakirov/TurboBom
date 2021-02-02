let bomModel = require('../models/bom_v2');
let tokenTools = require('../tools/token_tools');

const redisService = require('./redis.service');


const partModel = require('../models/part');

let filterDirectBoms = (boms) => boms.filter(bom => bom.nodeType === 'direct');

let getInterchanges = (d_boms, boms) => d_boms.map(db => {
    db.interchanges = boms.filter(b => b.bomPartId == db.partId).map((i) => parseInt(i.partId));
    return db
});

let filterBoms = (boms) => getInterchanges(filterDirectBoms(boms), boms);

let findBom = async (id, distance, depth) => filterBoms(await bomModel.findBom(id, parseInt(distance) || 1, depth || 5));

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

let isTiItem = (item) => item['manufacturer'] == 'Turbo International';

let _findBomEcommerce = async (id, part, distance, authorization) => {
    try {
        let bom = await bomModel.findBomCassandra(id, distance);
        boms = filterBomsCassandra(bom);
        boms.forEach(it => {
            if(isTiItem(it)) {
            } else {
                const tiPart = it.interchanges.sort((a,b) => (a.part_number > b.part_number) ? 1 : ((b.part_number > a.part_number) ? -1 : 0)).find(it => isTiItem(it));
                it['oe_sku'] = it['sku'];
                it['oe_part_number'] = it['part_number'];
                if(tiPart) {
                    it.interchanges = it.interchanges.filter(it => it != tiPart);
                    it['sku'] = tiPart['sku'];
                    it['part_number'] = tiPart['part_number'];
                } else {
                    delete it['sku'];
                    delete it['part_number'];
                }
            }
            delete it['relationDistance'];
            delete it['partId'];
            delete it['bomPartId'];
            delete it['nodeType'];
            delete it['relationType'];
        });
        addPrice(boms, authorization);
        if(!isTiItem(part)) {
            boms = boms.filter(it => it.oe_part_number);
        }
        boms = boms.sort((a,b) => (a.part_number > b.part_number) ? 1 : ((b.part_number > a.part_number) ? -1 : 0));
        return boms.filter(it => it['part_number']).concat(boms.filter(it => !it['part_number']));
    } catch(e) {
        console.log(e);
    }
}

let findBomEcommerce = async (id, authorization, distanceParam) => {
    let part = await partModel.getPart(id);
    let distance = parseInt(distanceParam) || 4;
    return (await _findBomEcommerce(id, part, distance, authorization));
}

let findBomPage = async (offset, limit, id, distance, depth) => filterBoms(await bomModel.findBomPage(offset, limit, id, parseInt(distance) || 1, depth || 5));

let findOnlyBom = async (id) => (await bomModel.findOnlyBom(id));

let convertToVertice = (response) => response.map((r) => {
    let bom = r.vertice;
    bom.qty = r.edge.quantity;
    return bom
})

let findBomAsChild = async (id) => (convertToVertice((await bomModel.findBomAsChild(id))));

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
    try {
        await bomModel.updateBom(req.params.parent_id, req.params.descendant_id, req.body.qty);
        res.json({
            success: true
        });
    } catch(e) {
        res.json({
            success: false
        });
    }
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