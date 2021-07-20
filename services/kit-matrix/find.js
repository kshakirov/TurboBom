let bomModel = require('../../models/bom_v2'),
    serviceKits = require('../service_kits_v2'),
    kitMatrix = require('../../models/kit_matrix_v2');

const whereUsedService = require('../where_used_v2');

const partModel = require('../../models/part');


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
            sku: v.sku
        }
        kit_matrix_rows[v.part_number][id] = v.qty;
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

let getKitMatrix = async (id, authorization) => {
    const part = await partModel.getPart(id);
    if(!part) {
        return [];
    }
    let turboTypes;
    let kits;
    if(part.partType == 'Turbo') {
        let turboType = (await kitMatrix.getTurboType(id))[0];
        kits = (await kitMatrix.getKitsByTurboType(turboType));
    } else {
        let whereUsed = (await whereUsedService.findWhereUsedData(id, authorization || false));
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
    if(value.length == 0) {
        return value;
    }
    let filteredValue = {};
    Object.keys(value[0]).forEach(key => {
        if(Object.keys(value[0][key]).length > 4)
            filteredValue[key] = value[0][key];
    });
    value[0] = filteredValue;
    value[1] = value[1].slice(0, 3).concat(value[1].filter(partNumber => Object.keys(filteredValue).filter(it => filteredValue[it][partNumber.title]).length > 0));
    return value;
}


exports.kitMatrixBase = kitMatrixBase;
exports.getKitMatrix = getKitMatrix;