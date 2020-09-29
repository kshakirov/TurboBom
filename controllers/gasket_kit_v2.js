let interchangeModel = require('../models/interchanges_v2');
let tokenTools = require('../tools/token_tools');
let gasketKitModel = require('../models/gasket_kits_v2');

let hidePrices = (mc) => mc.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (mc, user_data) =>
    mc.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group]
        }
        return b;
    })

let addPrice = (mc, authorization) => {
    let token = tokenTools.getToken(authorization);
    if (token) {
        let userData = tokenTools.verifyToken(token);
        if(userData) {
            return flattenPrice(mc, userData);
        }
    }
    return hidePrices(mc);
}

let convertTurboResponse = (turbos) => turbos.map(it => {
    return {
        'Turbo OE Part #': it.partNumber,
        'TI Part': it.interchanges.find(i => i.manufacturer == 'Turbo International').partNumber,
        'Description': it.description,
        'Interchanges': it.interchanges.map(i => i.partNumber),
        'Manufacturer': it.manufacturer,
        'Turbo Type': it.turboAttributes.turboType
    }
});

let findTurbosForGasketKit = async (req, res) => {
    let gasketKitPartNumber = await gasketKitModel.getGasketKitPartNumberById(parseInt(req.params.id));
    let turbos = await gasketKitModel.getTurbosByGasketKitPartNumber(gasketKitPartNumber[0]);
    let interchanges = await Promise.all(turbos.map(turbo => interchangeModel.findInterchange(turbo.partId)));
    turbos.forEach((turbo, index) => {
        turbo.interchanges = interchanges[index] ? interchanges[index] : [];
    });
    return res.json(convertTurboResponse(turbos));
}

let convertGasketKitResponse = (gasketKits) => gasketKits.map(it => {
    return {
        'Gasket Kit OE Part #': it.partNumber,
        'TI Part': it.interchanges.find(i => i.manufacturer == 'Turbo International').partNumber,
        'Description': it.description,
        'Interchanges': it.interchanges.map(i => i.partNumber),
        'Manufacturer': it.manufacturer,
        'Price': 'login'
    }
});

let findGasketKitForTurbo = async (req, res) => {
    let gasketKitPartNumbers = (await gasketKitModel.getGasketKitPartNumberByTurboId(parseInt(req.params.id)));
    if(gasketKitPartNumbers.length == 0 || gasketKitPartNumbers[0] == null) {
        res.json('');
    } else {
        let gasketKits = await gasketKitModel.getGasketKitByPartNumber(gasketKitPartNumbers[0]);
        let interchanges = await Promise.all(gasketKits.map(gasketKit => interchangeModel.findInterchange(gasketKit.partId)));
        gasketKits.forEach((gasketKit, index) => {
            gasketKit.interchanges = interchanges[index] ? interchanges[index] : [];
        });
        gasketKits = convertGasketKitResponse(gasketKits);
        addPrice(gasketKits, req.headers.authorization);
        res.json(gasketKits);
    }
}

exports.findGasketKitForTurbo = findGasketKitForTurbo;
exports.findTurbosForGasketKit = findTurbosForGasketKit;