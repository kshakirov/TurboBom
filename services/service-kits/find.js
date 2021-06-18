let interchangeModel = require('../../models/interchange/interchanges_v2'),
    kitMatrix = require('../../models/kit_matrix_v2');
let tokenTools = require('../../tools/token_tools');


let hidePrices = (data) => data.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (data, user_data) =>
    data.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group]
        }
        return b;
    })

let addPrice = (data, authorization) => {
    let token = tokenTools.getToken(authorization);
    if (token) {
        let userData = tokenTools.verifyToken(token);
        if(userData) {
            return flattenPrice(data, userData);
        }
    }
    return hidePrices(data);
}


let findServiceKitsBase = async (kits) => {
    var res = [];
    for(let i = 0; i < kits.length; i++) {
        let kit = kits[i];
        if(kit.manufacturer == 'Turbo International') {
            res.push({
                part_number: null,
                ti_part_number: kit.ti_part_number,
                tiSku: kit.tiSku,
                description: kit.description,
                manufacturer: 'Turbo International',
                sku: kit.tiSku,
                prices: kit.group_prices
            });
        } else {
            let interchanges = await interchangeModel.find(kit.tiSku);
            let interchange = interchanges
                .sort((a,b) => (a.partNumber > b.partNumber) ? 1 : ((b.partNumber > a.partNumber) ? -1 : 0))
                .find((interchange => interchange.manufacturer == 'Turbo International'));
            if(interchange) {
                res.push( {
                    part_number: kit.ti_part_number,
                    ti_part_number: interchange.partNumber,
                    sku: kit.tiSku,
                    description: kit.description.length == 0 ? null : kit.description,
                    manufacturer: kit.manufacturer,
                    tiSku: interchange.sku,
                    prices: interchange.group_prices
                });
            } else {
                res.push( {
                    part_number: kit.ti_part_number,
                    ti_part_number: null,
                    sku: kit.tiSku,
                    description: kit.description.length == 0 ? null : kit.description,
                    manufacturer: kit.manufacturer,
                    tiSku: null,
                    prices: null
                });
            }

        }
    }
    addPrice(res);
    return res;
}

let findServiceKitsInterchanges = async (id, authorization) => {
    let turboType = (await kitMatrix.getTurboType(id))[0];
    let kits = (await kitMatrix.getKitsByTurboType(turboType));
    return await findServiceKitsBase(kits, authorization);
}

exports.findServiceKitsBase = findServiceKitsBase;
exports.findServiceKits = findServiceKitsInterchanges;