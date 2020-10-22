const altBomModel = require('../models/alternative_bom_v2');

const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

let getHeaderId = (altBoms) => {
    const header = altBoms.filter((bom) => bom.type === 'alt_header');
    return header.length > 0 ? (header[0].header | header[0].altHeader) : null;
}

let getOnlyParts = (altBoms) => altBoms.filter(bom => bom.type !== 'alt_header').map(p => parseInt(p.partId));

const ALT_BOM_PREFIX = 'alt_bom_';
let findAltBom = async (req, res) => {
    try {
        let value = await redisClient.get(ALT_BOM_PREFIX + req.params.parent_part_id + '_' + req.params.child_part_id);
        if(!value || JSON.parse(value).length == 0) {
            const altBoms = (await altBomModel.findAlternativeBom(req.params.parent_part_id, req.params.child_part_id));
            value = {
                altHeaderId: getHeaderId(altBoms),
                parts: getOnlyParts(altBoms)
            }
            await redisClient.set(ALT_BOM_PREFIX + req.params.parent_part_id + '_' + req.params.child_part_id, JSON.stringify(value), 'EX', redisConfig.ttl);
        } else {
            value = JSON.parse(value);
        }
        res.json(value.altHeaderId !=null ? [value] : []);
    } catch (e) {
        res.send('There was a problem finding  the information in  the database. ' + e);
    }
}

let findAltBomPage = async (req, res) => {
    try {
        const altBoms = (await altBomModel.findAlternativeBomPage(req.params.offset, req.params.limit, req.params.parent_part_id, req.params.child_part_id));
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
exports.findAltBomPage = findAltBomPage;
exports.removeAltBom = removeAltBom;
exports.addAltBom = addAltBom;
exports.addAltGroup = addAltGroup;
exports.removeAltGroup = removeAltGroup;