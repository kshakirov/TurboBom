let bomModel = require('../../models/bom_v2');

let removeBom = async (parentId, descendantId) => {
    try {
        await bomModel.removeBom(parentId, descendantId);
        return {
            success: true
        };
    } catch(e) {
        return {
            success: false
        };
    }
}

let updateBom = async (parentId, descendantId, qty) => {
    try {
        await bomModel.updateBom(parentId, descendantId, qty);
        return {
            success: true
        };
    } catch(e) {
        return {
            success: false
        };
    }
}

let addBom = async (parentId, descendantId, qty) => {
    let response = {
        success: true
    };
    try {
        await bomModel.addBom(parentId, descendantId, qty);
    } catch(e) {
        response.success = false;
        response.msg = e.message;
    }
    return response;
}

exports.removeBom = removeBom;
exports.updateBom = updateBom;
exports.addBom = addBom;