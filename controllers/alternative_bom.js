let altBomModel = require("../models/alternative_bom");

function _get_header_id(alt_boms) {
    let header = alt_boms.filter((bom) => {
        if (bom.type === 'alt_header')
            return bom
    });
    if (header.length > 0) {
        let header_id = header[0].header | header[0].altHeader;
        return header_id
    }
    else
        return null;
}

function _get_only_parts(alt_boms) {
    return alt_boms.filter((bom) => {
        if (bom.type !== 'alt_header')
            return bom
    })
}


function addAltBom(req, res) {
    let response = {
        success: true
    };
    altBomModel.addAlternativeBom(req.params.parent_part_id,
        req.params.child_part_id, req.params.part_id,
        req.body.altHeaderId).then((promise) => {
        response.altHeaderId = promise;
        res.json(response);
    }, (err) => {
        response.success = false;
        response.msg = err.message;
        res.json(response);
    })
}

function removeAltBom(req, res) {
    let response = {
        success: true
    };
    altBomModel.removeAlternativeBom(req.params.part_id, req.params.alt_header_id).then(() => {
        altBomModel.findGroupByHeader(req.params.alt_header_id).then((alt_boms) => {
            response.groups = [
                {
                    altHeaderId: req.params.alt_header_id,
                    parts: alt_boms
                }
            ];
            res.json(response);
        })
    }, (err) => {
        response.success = false;
        response.message = err.message;
        res.json(response)
    })
}

function findAltBom(req, res) {
    altBomModel.findAlternativeBom(req.params.parent_part_id, req.params.child_part_id).then((alt_boms) => {
        //TODO we'll have several groups in the future
        let response = [];
        let group = {
            altHeaderId: _get_header_id(alt_boms),
            parts: _get_only_parts(alt_boms)
        }
        group.altHeaderId !=null ? response.push(group) : false;
        res.json(response)
    }, (err) => {
        res.send("There was a problem finding  the information in  the database. " + err);
    })
}

function addAltGroup(req, res) {
    let response = {
        success: true
    };
    let parent_id = req.params.parent_part_id,
        child_id = req.params.child_part_id,
        alt_header_id = req.params.altHeaderId || null;
    altBomModel.addAltInterchangeHeader(alt_header_id, parent_id, child_id)
        .then((alt_header) => {
            alt_header_id = alt_header._key;
            altBomModel.addPartrToAltGroup(parent_id, child_id, child_id, alt_header_id).then(() => {
                response.altHeaderId = alt_header_id;
                res.json(response)
            })
        }, (error) => {
            response.success = false;
            response.message = err.message;
            res.json(response);
        })
}

function removeAltGroup(req, res) {
    let response = {
        success: true
    };
    altBomModel.removeAltHeader(req.params.alt_header_id).then((data) => {
        response.groups = [];
        res.json(response);
    }, (error) => {
        response.success = false;
        response.message = err.message;
        res.json(response);
    })
}

exports.addAltBom = addAltBom;
exports.removeAltBom = removeAltBom;
exports.findAltBom = findAltBom;
exports.addAltGroup = addAltGroup;
exports.removeAltGroup = removeAltGroup;
