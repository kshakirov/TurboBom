let altBomModel = require("../models/alternative_bom");

function _get_header_id(alt_boms) {
    let header = alt_boms.filter((bom) => {
        if (bom.type === 'alt_header')
            return bom
    });
    if (header.length > 0)
        return header[0].header;
    else
        return null;
}

function _get_only_parts(alt_boms) {
    return alt_boms.filter((bom) => {
        if (bom.type != 'alt_header')
            return bom
    })
}


function addAltBom(req, res) {
    let response = {
        success: true
    };
    altBomModel.addAlternativeBom(req.params.parent_part_id,
        req.params.child_part_id, req.params.part_id,
        req.body.alt_header_id).then((promise) => {
        response.altHeaderId = promise;
        res.json(response);
    }, (err) => {
        response.success = false;
        response.msg = err.message;
        res.json(response);
    })
}

function removeAltBom(req, res) {
    altBomModel.removeAlternativeBom(req.params.part_id, req.params.alt_header_id).then(() => {
        altBomModel.findGroupByHeader(req.params.alt_header_id).then((alt_boms)=>{
            res.json([{
                altHeaderId: req.params.alt_header_id,
                parts: alt_boms
            }]);
        })
    }, (err) => {
        res.json({
            success: false,
            message: err.message
        })
    })
}

function findAltBom(req, res) {
    altBomModel.findAlternativeBom(req.params.parent_part_id, req.params.child_part_id).then((alt_boms) => {
        //TODO we'll have several groups in the future
        let response = [{
            altHeaderId: _get_header_id(alt_boms),
            parts: _get_only_parts(alt_boms)
        }];
        res.json(response)
    }, (err) => {
        res.send("There was a problem finding  the information in  the database. " + err);
    })
}

exports.addAltBom = addAltBom;
exports.removeAltBom = removeAltBom;
exports.findAltBom = findAltBom;
