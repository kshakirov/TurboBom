let altBomModel = require('../models/alternative_bom_v2');

let getHeaderId = (altBoms) => {
    const header = altBoms.filter((bom) => bom.type === 'alt_header');
    return header.length > 0 ? (header[0].header | header[0].altHeader) : null;
}

let getOnlyParts = (altBoms) => altBoms.filter(bom => bom.type !== 'alt_header').map(p => parseInt(p.partId));

let findAltBom = async (req, res) => {
    try {
        const altBoms = (await altBomModel.findAlternativeBom(req.params.parent_part_id, req.params.child_part_id));
        let group = {
            altHeaderId: getHeaderId(altBoms),
            parts: getOnlyParts(altBoms)
        }
        res.json(group.altHeaderId !=null ? [group] : []);
    } catch (e) {
        res.send('There was a problem finding  the information in  the database. ' + e);
    }
}

let removeAltBom = async (req, res) => {
    try {
        await altBomModel.removeAlternativeBom(req.params.part_id, req.params.alt_header_id);
        let altBoms = await altBomModel.findGroupByHeader(req.params.alt_header_id);
        res.json({
            success: true,
            groups: [
                {
                    altHeaderId: req.params.alt_header_id,
                    parts: altBoms
                }]
        });
    } catch(e) {
        res.json({
            success: false,
            message: e.message
        });
    }
}

let addAltBom = async (req, res) => {
    try {
        res.json({
            success: true,
            altHeaderId: (await altBomModel.addAlternativeBom(req.params.parent_part_id, req.params.child_part_id, req.params.part_id, req.body.altHeaderId))
        });
    } catch(e) {
        res.json({
            success: false,
            msg: e.message
        });
    }

}

let addAltGroup = async (req, res) => {
    try {
        let parentId = req.params.parent_part_id, childId = req.params.child_part_id, altHeaderId = req.params.altHeaderId || null;
        let alt_header = await altBomModel.addAltInterchangeHeader(altHeaderId, parentId, childId);
        altHeaderId = alt_header._key;
        await altBomModel.addPartrToAltGroup(parentId, childId, childId, altHeaderId);
        res.json({
            success: true,
            altHeaderId: altHeaderId
        });
    } catch(e) {
        res.json({
            success: false,
            message: e.message
        });
    }
}

let removeAltGroup = async (req, res) => {
    try {
        await altBomModel.removeAltHeader(req.params.alt_header_id);
        res.json({
            success: true,
            groups: []
        });
    } catch(e) {
        res.json({
            succes: false,
            message: e.message
        });
    }
}

exports.findAltBom = findAltBom;
exports.removeAltBom = removeAltBom;
exports.addAltBom = addAltBom;
exports.addAltGroup = addAltGroup;
exports.removeAltGroup = removeAltGroup;