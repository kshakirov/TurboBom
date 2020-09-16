let bomModel = require('../models/bom_v2');

let filterDirectBoms = (boms) => boms.filter(bom => bom.nodeType === 'direct');

let getInterchanges = (d_boms, boms) => d_boms.map(db => {
    db.interchanges = boms.filter(b => b.bomPartId == db.partId).map((i) => parseInt(i.partId));
    return db
});

let filterBoms = (boms) => getInterchanges(filterDirectBoms(boms), boms);

let findBom = async (req, res) => res.json(filterBoms(await bomModel.findBom(req.params.id, parseInt(req.query.distance) || 1, req.query.depth || 5)));

let findBomEcommerce = async (req, res) => res.json(filterBoms(await bomModel.findBomEcommerce(req.params.id, parseInt(req.query.distance) || 1)));

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
exports.findBomPage = findBomPage;
exports.findOnlyBom = findOnlyBom;
exports.findBomAsChild = findBomAsChild;
exports.removeBom = removeBom;
exports.updateBom = updateBom;
exports.addBom = addBom;