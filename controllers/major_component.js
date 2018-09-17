let BomController = require('./bom'),
    distance = 4,
    recursion_level = 40,
    major_components = [
        "Compressor Wheel",
        "Turbine Wheel",
        "Bearing Housing",
        "Backplate / Sealplate",
        "Heatshield / Shroud",
        "Nozzle Ring",
        "Actuator",
        "Seal Plate",
        "Cartridge"
    ];


function is_ti_part(manufacturer) {
    if (manufacturer != null)
        return manufacturer.toLowerCase() == 'turbo international'
    else
        return false;
}

function filter_major_components(boms) {
    return boms.filter(b => major_components.includes(b.part_type));
}


function add_oe_info(b) {

}

function add_ti_part(b) {
    if (b.hasOwnProperty('interchanges') && b.interchanges != null) {
        let ti_part = b.interchanges.find(i => is_ti_part(i.manufacturer));
        if (ti_part) {
            b.oe_sku = b.sku;
            b.oe_part_number = b.part_number;
            b.sku = ti_part.sku;
            b.part_number = ti_part.part_number;
            b.interchanges = b.interchanges.filter(i => i.sku !== ti_part.sku)
        }
    }
    return null;
}

function prep_component(b) {
    if (is_ti_part(b.manufacturer)) {

    }
    else {
        add_ti_part(b)
    }
}

function prep_response(boms) {
    return filter_major_components(boms).map(b => {
        prep_component(b);
        return b
    })

}


function major_component_base(sku) {
    return BomController.findBomCassandraTest(sku, distance, recursion_level).then(r => {
        return prep_response(r);
    }, error => {
        return false;
    });

}

function major_component(req, res) {
    return major_component_base(req.params.id).then(promise => {
        if (promise) {
            res.set('Connection', 'close');
            res.json(promise);
        } else {
            res.send("There was a problem getting kit matrix. ");
        }
    })
}

exports.findMajorComponentBase = major_component_base;
exports.findMajorComponent = major_component;
