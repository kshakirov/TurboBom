let WhereUsedModel = require('../models/where_used'),
    token_tools = require('./token_tools'),
    Set = require('set');

function filter_pairs(recs) {
    return recs.filter(rec => {
        if (rec.type === 'part' && rec.edge_type === 'interchange') {
            if (rec.interchange !== null && rec.interchange.part_type === 'Cartridge') {
                if (rec.interchange.manufacturer === 'Turbo International' ||
                    rec.attributes.manufacturer === 'Turbo International')
                    return true;
            }

        }
    })
}

function filter_turbo_groups(recs) {
    return recs.filter(rec => {
        if (rec.type == 'part' && rec.edge_type == 'direct') {
            if (rec.bom != null && rec.bom.part_type == 'Cartridge') {
                return true
            }
        }
    })
}

function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}


function get_ti_sku(p) {
    if (p.attributes.manufacturer == "Turbo International") {
        return p.sku

    }
    if (p.hasOwnProperty('interchange_sku')) {
        return p.interchange_sku
    }
    else
        return null;
}

function get_sku(p) {
    if (p.attributes.manufacturer == "Turbo International") {
        return p.interchange_sku;
    }
    return p.sku
}


function get_ti_part_number(p) {
    if (p.attributes.manufacturer == "Turbo International") {
        return p.attributes.part_number;
    }
    if (p.hasOwnProperty('interchange') && p.interchange !== null)
        return p.interchange.part_number;
    else
        return null
}

function get_part_number(p) {
    if (p.attributes.manufacturer == "Turbo International") {
        return p.interchange.part_number;
    }
    return p.attributes.part_number
}

function get_ti_part_price(p) {
    if (p.attributes.manufacturer == "Turbo International") {
        return p.attributes.prices;
    }
    return false
}

function filter_turbo_interchanges(recs) {
    let tis = recs.filter(rec => {
        if (rec.type === 'part' && rec.edge_type === 'interchange') {
            if (rec.interchange !== null && rec.interchange.part_type === 'Turbo') {
                if (rec.attributes.part_type === 'Turbo')
                    return true;
            }
        }
    });
    return tis.map(ti => {
        return {
            header: ti.interchange_header,
            turbos: [
                ti.attributes.part_number,
                ti.interchange.part_number
            ]
        }
    })
}

function group_by_header(turbo_interchanges) {
    let result = {};
    turbo_interchanges.forEach(ti => {
        if (result.hasOwnProperty(ti.header)) {
            result[ti.header] = result[ti.header].union(new Set(ti.turbos))
        } else {
            result[ti.header] = new Set(ti.turbos);
        }
    });
    return Object.values(result).map(s => s.get(0));
    //return result;
}


function prep_response(pairs, turbo_groups) {
    return pairs.map(p => {
        let group = turbo_groups.filter(g => {
            if (g.bom_sku == p.sku || g.bom_sku == p.interchange_sku)
                return true;
        });
        let headers = group.map(g => g.interchange_header);
        return {
            description: "",
            manufacturer: p.attributes.manufacturer,
            part_type: p.attributes.part_type,
            sku: get_sku(p),
            tiSku: get_ti_sku(p),
            partNumber: get_part_number(p),
            tiPartNumber: get_ti_part_number(p),
            turboPartNumbers: group.map(g => g.attributes.part_number),
            prices: get_ti_part_price(p),
            header: p.interchange_header
        }
    })
}

function prep_for_cartridges(turbo_groups) {
    let turbos_hash ={},
        turbos = turbo_groups.map(tg => {
        return {
            description: "",
            manufacturer: tg.attributes.manufacturer,
            part_type: tg.attributes.part_type,
            sku: get_sku(tg),
            tiSku: get_ti_sku(tg),
            partNumber: get_part_number(tg),
            tiPartNumber: get_ti_part_number(tg),
            prices: get_ti_part_price(tg),
            header: tg.interchange_header
        }
    });
    turbos.forEach(t=>{
        turbos_hash[t.sku] = t;
    });
    return turbos_hash;
}

function add_turbos(response, turbo_interchanges) {
    return response.map(r => {
        let numbers = new Set(r.turboPartNumbers);
        turbo_interchanges.forEach(ti => {
            let sti = new Set(ti);
            if (!numbers.intersect(sti).empty()) {
                numbers = numbers.union(sti);
            }
        });
        r.turboPartNumbers = numbers.get(0);
        return r;
    })
}

function pack_full_response(resp_full) {
    let result = {};
    resp_full.forEach(r => {
        if (result.hasOwnProperty(r.tiSku)) {
            let o_tp = new Set(result[r.tiSku].turboPartNumbers),
                n_tp = new Set(r.turboPartNumbers);
            result[r.tiSku].turboPartNumbers = o_tp.union(n_tp).get(0)
        } else {
            result[r.tiSku] = r;
        }
    });
    return result;
}


function flatten_price(mc, user_data) {
    Object.keys(mc).forEach(key => {
        if (mc[key].prices != null) {
            mc[key].prices = mc[key].prices[user_data.customer.group]
        }
    });
    return mc;
}

function hide_prices(mc) {
    Object.keys(mc).map(b => {
        mc[key].prices = "login";
    });
    return mc;
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

function where_used_cassandra(sku) {
    return WhereUsedModel.findWhereUsedCassandra(sku).then(r => {

        let group = group_by_header(filter_turbo_interchanges(r));
        let resp_full = add_turbos(prep_response(filter_pairs(r), filter_turbo_groups(r)), group);

        return pack_full_response(resp_full)
    });
}

function findWhereUsedCassandra(req, res) {
    let authorization = req.headers.authorization || false;
    WhereUsedModel.findWhereUsedCassandra([req.params.id], []).then(
        function (where_used) {
            let group = group_by_header(filter_turbo_interchanges(where_used));
            let pairs = filter_pairs(where_used),
                turbo_groups = filter_turbo_groups(where_used);
            let resp = {};
            if (pairs.length > 0) {
                resp = add_turbos(prep_response(pairs,
                    turbo_groups), group);
                res.set('Connection', 'close');
                res.json(add_price(pack_full_response(resp), authorization));
            } else if (turbo_groups.length > 0) {
                resp = prep_for_cartridges(turbo_groups);
                res.set('Connection', 'close');
                res.json(resp);
            }

        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}


exports.findWhereUsedCassandraTest = where_used_cassandra;
exports.findWhereUsedCassandra = findWhereUsedCassandra;
