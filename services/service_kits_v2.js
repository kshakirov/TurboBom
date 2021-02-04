let interchangeModel = require('../models/interchanges/interchanges_v2'),
    kitMatrix = require('../models/kit_matrix_v2');
let tokenTools = require('../tools/token_tools');

const redisService = require('./redis.service');

let isTiManufacturer = (p) => p.hasOwnProperty('manufacturer') && p.manufacturer != null ? p.manufacturer.toLowerCase() === 'turbo international' : false;

let nullifyForeign = (p) => {
    return {
        tiSku: p.kit.sku,
        sku: '',
        ti_part_number: p.kit.part_number,
        part_number: '',
        manufacturer: p.kit.manufacturer,
        description: p.kit.description,
        prices: p.kit.prices
    }
}

let createTiPart = (p) => {
    let tiPart = p.ret.find(r => isTiManufacturer(r.attributes));
    if (tiPart !==undefined && tiPart !==null) {
        return {
            ti_part_number: tiPart.attributes.part_number,
            tiSku: tiPart.sku,
            sku: p.kit.sku,
            part_number: p.kit.part_number,
            manufacturer: p.kit.manufacturer,
            description: p.kit.description,
            prices: p.kit.prices
        };
    }
}

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

let prepareResponse = (kits) => kits.map(p => isTiManufacturer(p.kit) ? nullifyForeign(p) : createTiPart(p));

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
    // let interchanges = await Promise.all(kits.map(k => interchangeModel.find(k.tiSku)));
    // let tiInterchanges = {};
    // let usedTiInterchanges = {};
    // kits.forEach((kit, kitCnt) => {
    //     if(interchanges[kitCnt].length == 0) {
    //         res.push({
    //             tiSku: kit.tiSku,
    //             sku: null,
    //             ti_part_number: kit.ti_part_number,
    //             part_number: null,
    //             manufacturer: 'Turbo International',
    //             description: null,
    //             prices: kit.group_prices
    //         });
    //         addPrice(res);
    //     } else {
    //          interchanges[kitCnt].filter((interchange => interchange.manufacturer == 'Turbo International')).forEach(it => {
    //              tiInterchanges[it.sku] = it;
    //          });
    //         let interchange = interchanges[kitCnt]
    //             .sort((a,b) => (a.partNumber > b.partNumber) ? 1 : ((b.partNumber > a.partNumber) ? -1 : 0))
    //             .find((interchange => interchange.manufacturer == 'Turbo International'));
    //         if(interchange) {
    //             usedTiInterchanges[interchange.sku] = interchange;
    //             res.push( {
    //                 part_number: kit.ti_part_number,
    //                 ti_part_number: interchange.partNumber,
    //                 sku: kit.tiSku,
    //                 description: kit.description.length == 0 ? null : kit.description,
    //                 manufacturer: kit.manufacturer,
    //                 tiSku: interchange.sku,
    //                 prices: interchange.group_prices
    //             });
    //         }
    //         addPrice(res);
    //     }
    //     // if(interchanges[kitCnt].length == 0) {
    //     //     res.push({
    //     //         tiSku: kit.tiSku,
    //     //         sku: null,
    //     //         ti_part_number: kit.ti_part_number,
    //     //         part_number: null,
    //     //         manufacturer: 'Turbo International',
    //     //         description: null,
    //     //         prices: kit.group_prices
    //     //     });
    //     //     addPrice(res);
    //     // } else {
    //     //     interchanges[kitCnt].forEach((interchange) => {
    //     //         res.push({
    //     //             part_number: interchange.manufacturer == 'Turbo International' ? null : interchange.partNumber,
    //     //             ti_part_number: interchange.manufacturer == 'Turbo International' ? interchange.partNumber : kit.ti_part_number,
    //     //             sku: interchange.sku,
    //     //             description: interchange.description.length == 0 ? null : interchange.description,
    //     //             manufacturer: interchange.manufacturer,
    //     //             tiSku: interchange.manufacturer == 'Turbo International' ? interchange.sku : kit.tiSku,
    //     //             prices: interchange.group_prices
    //     //         });
    //     //     });
    //     //     addPrice(res);
    //     // }
    // } );
    return res;
}

const SERVICE_KITS_PREFIX = 'service_kits_';
let findServiceKitsInterchanges = async (req, res) => {
    try {
        let value = await redisService.getItem(SERVICE_KITS_PREFIX + req.params.id);
        if(!value || JSON.parse(value).length == 0) {
            let turboType = (await kitMatrix.getTurboType(req.params.id))[0];
            let kits = (await kitMatrix.getKitsByTurboType(turboType));
            value = await findServiceKitsBase(kits, req.headers.authorization);
            await redisService.setItem(SERVICE_KITS_PREFIX + req.params.id, JSON.stringify(value));
        } else {
            value = JSON.parse(value);
        }

        res.set('Connection', 'close');
        res.json(value);
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

exports.findServiceKitsBase = findServiceKitsBase;
exports.findServiceKits = findServiceKitsInterchanges;