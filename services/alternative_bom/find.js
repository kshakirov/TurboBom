const altBomModel = require('../../models/alternative_bom_v2');

let getHeaderId = (altBoms) => {
    const header = altBoms.filter((bom) => bom.type === 'alt_header');
    return header.length > 0 ? (header[0].header | header[0].altHeader) : null;
}

let getOnlyParts = (altBoms) => altBoms.filter(bom => bom.type !== 'alt_header').map(p => parseInt(p.partId));


let findAltBom = async (parentPartId, childPartId) => {
    const altBoms = (await altBomModel.findAlternativeBom(parentPartId, childPartId));
    const value = {
        altHeaderId: getHeaderId(altBoms),
        parts: getOnlyParts(altBoms)
    }
    return value.altHeaderId !=null ? [value] : [];
}

let findAltBomPage = async (offset, limit, parentPartId, childPartId) => {
    const altBoms = (await altBomModel.findAlternativeBomPage(offset, limit, parentPartId, childPartId));
    let group = {
        altHeaderId: getHeaderId(altBoms),
        parts: getOnlyParts(altBoms)
    }
    return group.altHeaderId !=null ? [group] : [];
}

exports.findAltBom = findAltBom;
exports.findAltBomPage = findAltBomPage;