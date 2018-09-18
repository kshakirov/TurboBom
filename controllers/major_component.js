let BomController = require('./bom'),
    distance = 4,
    recursion_level = 40,
    token_tools = require('./token_tools'),
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
            b.prices = ti_part.prices;
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


function flatten_price(mc, user_data) {
    return mc.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group]
        }
        return b
    })
}

function hide_prices(mc) {
    return mc.map(b => {
        b.prices = "login";
        return b
    })
}

function add_price(mc, authorization) {
    let token = token_tools.getToken(authorization);
    if (token) {
        let user_data = token_tools.verifyToken(token);
        return flatten_price(mc, user_data)
    } else {
        return hide_prices(mc)
    }


}


function major_component_base(sku, authorization) {
    return BomController.findBomCassandraTest(sku, distance, recursion_level, authorization).then(r => {
        let mc = prep_response(r);
        return add_price(mc, authorization)
    }, error => {
        return false;
    });

}

function major_component(req, res) {
    let authorization = req.headers.authorization || false;
    return major_component_base(req.params.id, authorization).then(promise => {
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
