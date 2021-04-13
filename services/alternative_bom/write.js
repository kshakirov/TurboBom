const altBomModel = require('../../models/alternative_bom_v2');

let removeAltBom = async (partId, altHeaderId) => {
    await altBomModel.removeAlternativeBom(partId, altHeaderId);
    return {
        success: true,
        groups: [
            {
                altHeaderId: altHeaderId,
                parts: (await altBomModel.findGroupByHeader(altHeaderId))
            }]
    };
}

let addAltBom = async (parentPartId, childPartId, partId, altHeaderId) => ({
    success: true,
    altHeaderId: (await altBomModel.addAlternativeBom(parentPartId, childPartId, partId, altHeaderId))
})

let addAltGroup = async (parentId, childId, altHeaderId) => {
    let altHeader = await altBomModel.addAltInterchangeHeader(altHeaderId, parentId, childId);
    altHeaderId = altHeader._key;
    await altBomModel.addPartrToAltGroup(parentId, childId, childId, altHeaderId);
    return {
        success: true,
        altHeaderId: altHeaderId
    };
}

let removeAltGroup = async (altHeaderId) => {
    altBomModel.removeAltHeader(altHeaderId);
    return {
        success: true,
        groups: []
    };
}

exports.removeAltBom = removeAltBom;
exports.addAltBom = addAltBom;
exports.addAltGroup = addAltGroup;
exports.removeAltGroup = removeAltGroup;