let partModel = require('../models/part');
let interchangeModel = require('../models/interchanges_v2');

let transformInterchanges = (interchanges) => interchanges.map(it => {
    return {
        'id': it.sku,
        'manufacturer': it.manufacturer,
        'partType': it.partType,
        'description': it.description,
        'part_number': it.partNumber,
        'inactive': it.inactive,
        'sku': it.sku
    };
});

let calculateDiff = (originalValue, currentValue) => originalValue == currentValue ? 'STD' : Math.abs(originalValue - currentValue).toFixed(4);

let getStandardOversize = async (req, res) => {
    let id = req.params.id;
    let part = await partModel.getPart(id);
    if(part.standardOversize) {
        if(part.standardOversize.standard_part) {
            part = await partModel.getPart(part.standardOversize.standard_part.toString());
        }
        let originalInterchanges = transformInterchanges(await interchangeModel.find(part.sku));
        let additionalParts = await partModel.getParts(part.standardOversize.skus);
        let additionalPartsInterchanges = additionalParts.map(it => interchangeModel.find(it.sku.toString()));
        Promise.all(additionalPartsInterchanges).then(resolvedInterchanges => {
            let table = [];
            let indx = 0;
            for(let currentPart of additionalParts) {
                table.push({
                    'maxOuterDiameter': currentPart.standardOversize.journal_bearing.max_outer_diameter,
                    'minOuterDiameter': currentPart.standardOversize.journal_bearing.min_outer_diameter,
                    'minInnerDiameter': currentPart.standardOversize.journal_bearing.min_inner_diameter,
                    'maxInnerDiameter': currentPart.standardOversize.journal_bearing.max_inner_diameter,
                    'maxOuterDiameter_out': calculateDiff(part.standardOversize.journal_bearing.max_outer_diameter, currentPart.standardOversize.journal_bearing.max_outer_diameter),
                    'minOuterDiameter_out': calculateDiff(part.standardOversize.journal_bearing.min_outer_diameter, currentPart.standardOversize.journal_bearing.min_outer_diameter),
                    'minInnerDiameter_out': calculateDiff(part.standardOversize.journal_bearing.min_inner_diameter, currentPart.standardOversize.journal_bearing.min_inner_diameter),
                    'maxInnerDiameter_out': calculateDiff(part.standardOversize.journal_bearing.max_inner_diameter, currentPart.standardOversize.journal_bearing.max_inner_diameter),
                    'manufacturer': currentPart.manufacturer,
                    'part_number': currentPart.partNumber,
                    'sku': currentPart.sku,
                    'interchanges':transformInterchanges(resolvedInterchanges[indx++])
                });
            }

            let response = {
                'original_part': {
                    'maxOuterDiameter': part.standardOversize.journal_bearing.max_outer_diameter,
                    'minOuterDiameter': part.standardOversize.journal_bearing.min_outer_diameter,
                    'minInnerDiameter': part.standardOversize.journal_bearing.min_inner_diameter,
                    'maxInnerDiameter': part.standardOversize.journal_bearing.max_inner_diameter,
                    'width': part.standardOversize.journal_bearing.width,
                    'sku': part.sku,
                    'part_number': part.partNumber,
                    'interchanges': originalInterchanges
                },
                'table': table
            };


            res.json(response);
        });
    } else {
        res.json({});
    }


}

exports.getStandardOversize = getStandardOversize;