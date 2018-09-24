let bom_model = require('../models/bom'),
    service_kits = require('../controllers/service_kits'),
    client = require('node-rest-client-promise').Client(),
    config = require('config'),
    metadata = config.get('TurboGraph.metadata');

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


let base_header_array =
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


function dedup_kit_matrix_header(headers) {
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


function create_kit_matrix_table(kits) {
    let kit_matrix_rows = {},
        kit_matrix_headers = [];
    let ks = kits.forEach(value => {
        let id = value.part_number,
            sku = value.sku;
        if (value.manufacturer === 'Turbo International') {
            create_header(id, sku, kit_matrix_headers);
            value.bom.forEach(v => {
                create_row(id, v, kit_matrix_rows)
            })
        }

    });
    kit_matrix_headers = dedup_kit_matrix_header(kit_matrix_headers);
    return [kit_matrix_rows, base_header_array.concat(kit_matrix_headers)]
}


function prep_bom(boms) {
    return boms.map(bom => {
        return {
            sku: bom.partId,
            qty: bom.qty,
            part_number: bom.attributes.part_number,
            part_type: bom.attributes.part_type
        }
    })
}

function prep_kit_matrix(km) {
    return km.map(k => {
        return {
            manufacturer: "Turbo International",
            sku: k.kit.tiSku,
            part_number: k.kit.ti_part_number,
            bom: prep_bom(k.bom)
        }
    })
}

function kit_matrix_base(kits) {
    return service_kits.findServiceKitsBase(kits).then(sk => {
        sk = sk.filter(s => s !== undefined);
        return Promise.all(sk.map(s => bom_model.findOnlyBom(s.tiSku)
        )).then(promises => {
            let km = promises.map((x, xi) => (
                {
                    kit: sk[xi],
                    bom: x
                }
            ));
            let nkm = prep_kit_matrix(km);
            return create_kit_matrix_table(nkm)
        }, error => {
            return false;
        })


    }, error => {
        return false;
    })
}

function kit_matrix(req, res) {
    let url = `http://${metadata.host}:${metadata.port}/product/${req.params.id}/kit/`;
    client.getPromise(url).then(response => {
            let kits = response.data;
            if (kits != null && kits.length > 0) {
                kit_matrix_base(kits).then(promise => {
                    if (promise) {
                        res.set('Connection', 'close');
                        res.json(promise);
                    } else {
                        res.send("There was a problem getting kit matrix. ");
                    }
                })
            } else {
                res.set('Connection', 'close');
                res.json([]);
            }
        },
        error => {
            res.send("There was a problem adding the information to the database. " + error);
        }
    )
}


exports.kitMatrixBase = kit_matrix_base;
exports.kitMatrix = kit_matrix;
