let interchangeModel = require('../models/interchanges_v2'),
    client = require('node-rest-client-promise').Client(),
    config = require('config'),
    kitMatrix = require('../models/kit_matrix_v2');


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

let prepareResponse = (kits) => kits.map(p => isTiManufacturer(p.kit) ? nullifyForeign(p) : createTiPart(p));

let findServiceKitsBase = async (kits) => {
    var res = [];
    let interchanges = await Promise.all(kits.map(k => interchangeModel.findInterchange(k.tiSku)));
    kits.forEach((kit, kitCnt) => {
        if(interchanges[kitCnt].length == 0) {
            res.push({
                tiSku: kit.tiSku,
                sku: null,
                ti_part_number: kit.ti_part_number,
                part_number: null,
                manufacturer: 'Turbo International',
                description: null,
                prices: 'login'
            });
        } else {
            interchanges[kitCnt].forEach((interchange) => {
                res.push({
                    tiSku: kit.tiSku,
                    sku: interchange.sku,
                    ti_part_number: kit.ti_part_number,
                    part_number: interchange.partNumber,
                    manufacturer: 'Turbo International',
                    description: interchange.description,
                    prices: 'login'
                });
            });
        }
    } );
    return res;
}

let findServiceKitsInterchanges = async (req, res) => {
    try {
        let turboType = (await kitMatrix.getTurboType(req.params.id))[0];
        let kits = (await kitMatrix.getKitsByTurboType(turboType));
        let kitsBase = await findServiceKitsBase(kits);
        res.set('Connection', 'close');
        res.json(kitsBase);
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

exports.findServiceKitsBase = findServiceKitsBase;
exports.findServiceKits = findServiceKitsInterchanges;