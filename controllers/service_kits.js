let interchange_model = require('../models/interchanges'),
    test_kits = kits = [{
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
        }];


function is_ti_manufacturer(p) {
    if (p.hasOwnProperty('manufacturer') && p.manufacturer != null) {
        return p.manufacturer.toLowerCase() === 'turbo international'
    }
    return false;
}

function nullify_foreign(p) {
    return {
        tiSku: p.kit.sku,
        sku: "",
        ti_part_number: p.part_number,
        part_number: "",
        manufacturer: p.kit.manufacturer,
        description: p.kit.description,
        prices: p.kit.prices
    }
}

function crete_ti_part(p) {
    let ti_part = p.ret.find(r => is_ti_manufacturer(r.attributes));
    if (ti_part) {
        return {
            ti_part_number: ti_part.attributes.part_number,
            tiSku: ti_part.sku,
            sku: p.kit.sku,
            part_number: p.kit.part_number,
            manufacturer: p.kit.manufacturer,
            description: p.kit.description,
            prices: p.kit.prices
        }
    }
}

function prep_response(promises) {
    return promises.map(p => {
        if (is_ti_manufacturer(p.kit)) {
            return nullify_foreign(p)
        } else {
            return crete_ti_part(p)
        }
    })
}

function find_service_kits_base(kits) {
    return Promise.all(kits.map(k => interchange_model.findInterchange(k.sku))).then(promises => {
        let rs = promises.map((x, xi) => (
            {
                kit: kits[xi],
                ret: x
            }
        ));
        return prep_response(rs)
    });


}


function findServiceKitsInterchanges(req, res) {
    let kits = test_kits;
    find_service_kits_base(kits).then(
        service_kits => {
            res.set('Connection', 'close');
            res.json(service_kits);
        },
        err => {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

exports.findServiceKitsTest = find_service_kits_base;
exports.findServiceKits = findServiceKitsInterchanges;
