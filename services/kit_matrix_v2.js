let bomModel = require('../models/bom_v2'),
    serviceKits = require('.//service_kits_v2'),
    kitMatrix = require('../models/kit_matrix_v2'),
    partController = require('.//part'),
    whereUsed = require('../models/where_used');

const whereUsedService = require('.//where_used_v2');

const partModel = require('../models/part');

const redisService = require('./redis.service');

let test_kits = [{
    "part_number": "200115-0000",
    "sku": 40272,
    "description": null,
    "manufacturer": "Garrett",
},
    {
        "part_number": "468139-0000",

        "sku": 40333,
        "description": null,
        "manufacturer": "Garrett",
    },
    {
        "part_number": "707897-0001",
        "sku": 40409,
        "description": null,
        "manufacturer": "Garrett",
    }]


let baseHeaderArray =
    [
        {
            field: 'part_number', title: 'Name', show: true
        },
        {
            field: 'part_type', title: 'Part', show: true
        },
        {
            field: 'description', title: 'Desc', show: true
        }
    ];


function create_row(id, v, kit_matrix_rows) {
    if (kit_matrix_rows.hasOwnProperty(v.part_number)) {
        kit_matrix_rows[v.part_number][id] = v.qty
    }
    else {
        kit_matrix_rows[v.part_number] = {
            part_number: v.part_number,
            description: v.description,
            part_type: v.part_type,
            id: v.qty,
            sku: v.sku
        }
    }
}


function create_header(name, sku, headers) {
    headers.push(
        {
            field: name,
            title: name,
            show: true,
            sku: sku
        }
    )
}


let dedupKitMatrixHeader = (headers) => {
    let h_hash = {};
    return headers.filter(h => {
        if (h_hash.hasOwnProperty(h.field))
            return false;
        else {
            h_hash[h.field] = true;
            return true
        }
    })
}


let createKitMatrixTable = (kits) => {
    let kitMatrixRows = {},
        kitMatrixHeaders = [];
    kits.forEach(value => {
        let id = value.part_number,
            sku = value.sku;
        if (value.manufacturer === 'Turbo International') {
            create_header(id, sku, kitMatrixHeaders);
            value.bom.forEach(v => {
                create_row(id, v, kitMatrixRows)
            });
        }

    });
    kitMatrixHeaders = dedupKitMatrixHeader(kitMatrixHeaders);
    if(Object.keys(kitMatrixRows).length == 0) return [];
    return [kitMatrixRows, baseHeaderArray.concat(kitMatrixHeaders)]
}


let prepBom = (boms) => {
    return boms.map(bom => {
        return {
            sku: bom.partId,
            qty: bom.qty,
            part_number: bom.attributes.part_number,
            part_type: bom.attributes.part_type
        }
    })
}

let prepKitMatrix = (km) => {
    return km.map(k => {
        return {
            manufacturer: 'Turbo International',
            sku: k.kit.tiSku,
            part_number: k.kit.ti_part_number,
            bom: k.bom
        }
    })
}

let kitMatrixBase = async (kits) => {
    try {
        let sk = (await serviceKits.findServiceKitsBase(kits)).filter(s => s !== undefined);
        let boms = await sk.map(s => bomModel.findOnlyBom(s.tiSku));
        let km = boms.map((x, xi) => (
            {
                kit: sk[xi],
                bom: x
            }
        ));
        let nkm = prepKitMatrix(km);
        return createKitMatrixTable(nkm);
    } catch(e) {
        return false;
    }
}


let isTurbo = (p) => p.attributes.part_type.toLowerCase() === 'turbo';

let isCartridge = (p) => p.attributes.part_type.toLowerCase() === 'cartridge';

let getParentTurbos = (wus, p) => {
    if (wus !== null && wus !== undefined && p.attributes !== null) {
        let turbo = wus.find(wu => {
            return wu.hasOwnProperty('attributes') &&
                wu.attributes !== null && wu.attributes !== undefined &&
                wu.attributes.manufacturer !== null
        });
        if (turbo != null && turbo !== undefined)
            return turbo.partId

    } else {
        return false;
    }

}

let checkTurboCartridge = (sku) => {
    return partController.part(sku).then(p => {
        if (isTurbo(p)) {
            return sku;
        } else if (isCartridge(p)) {
            return whereUsed.findWhereUsed(sku).then(wus => {
                return getParentTurbos(wus, p)
            }, error => {
                return false;
            })
        } else
            return false;
    }, error => {

    })
}

const KIT_MATRIX_PREFIX = 'kit_matrix_';
let getKitMatrix = async (req, res) => {
    try {
        let part;
        try {
            part = await partModel.getPart(req.params.id);
        } catch(e) {
            res.json([]);
            return;
        }
        let value = await redisService.getItem(KIT_MATRIX_PREFIX + req.params.id);
        if(!value || JSON.parse(value).length == 0) {
            let turboTypes;
            let kits;
            if(part.partType == 'Turbo') {
                let turboType = (await kitMatrix.getTurboType(req.params.id))[0];
                kits = (await kitMatrix.getKitsByTurboType(turboType));
            } else { // todo: only for cartridges? if(part.partType == 'Cartridge')
                let whereUsed = (await whereUsedService.findWhereUsedData(req.params.id, req.headers.authorization || false));
                turboTypes = Array.from(new Set(Object.keys(whereUsed).map(it => whereUsed[it].turboType)));
                kits = [];
                (await Promise.all(turboTypes.map(turboType => (kitMatrix.getKitsByTurboType(turboType))))).forEach(turboTypeKits => {
                    kits = kits.concat(turboTypeKits);
                });
            }
            let kitBomPairs = (await Promise.all(kits.map(kit => bomModel.findOnlyTiDirectBom(kit.tiSku))))
                .map((x, xi) => (
                    {
                        kit: kits[xi],
                        bom: x
                    }
                ));
            let preparedMatrix = prepKitMatrix(kitBomPairs);
            value = createKitMatrixTable(preparedMatrix);
            let filteredValue = {};
            Object.keys(value[0]).forEach(key => {
                if(Object.keys(value[0][key]).length > 5)
                    filteredValue[key] = value[0][key];
            });
            value[0] = filteredValue;
            await redisService.setItem(KIT_MATRIX_PREFIX + req.params.id, JSON.stringify(value));
        } else {
            value = JSON.parse(value);
        }

        res.set('Connection', 'close');
        res.json(value);
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}


exports.kitMatrixBase = kitMatrixBase;
exports.getKitMatrix = getKitMatrix;