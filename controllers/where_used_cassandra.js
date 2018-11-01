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
    if (p.attributes != null && p.attributes.hasOwnProperty('part_number'))
        return p.attributes.part_number;
    else
        return null
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

function get_turbo_part_numbers(group) {
    let tpn = group.filter(g => g.attributes !== null);
    return tpn.map(g => g.attributes.part_number)
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
            turboPartNumbers: get_turbo_part_numbers(group),
            prices: get_ti_part_price(p),
            header: p.interchange_header
        }
    })
}

function prep_for_cartridges(turbo_groups) {
    let turbos_hash = {},
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
    turbos.forEach(t => {
        turbos_hash[t.sku] = t;
    });
    return turbos_hash;
}

function add_turbos(response, turbo_interchanges) {
    return response.map(r => {
        let numbers = new Set(r.turboPartNumbers);
        if(Array.isArray(turbo_interchanges)) {
            turbo_interchanges.forEach(ti => {
                let sti = new Set(ti);
                if (!numbers.intersect(sti).empty()) {
                    numbers = numbers.union(sti);
                }
            });
        }
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
            } else {
                res.set('Connection', 'close');
                res.json({});

            }

        },
        function (err) {
            res.send("There was a problem adding the information to the database. " + err);
        }
    );
}

function create_item(wu) {
    return {
        attributes: wu.attributes,
        relationDistance: wu.relationDistance,
        relationType: wu.relationType,
        partId: wu.sku

    }
}


function create_interchange_hash_fw(int_hash, wu) {
    let i = {};
    i[wu.interchange_sku] = {
        partId: wu.interchange_sku,
        attributes: wu.interchange_attributes
    };
    int_hash[wu.sku] = {
        partId: wu.sku,
        attributes: wu.attributes,
        interchanges: i,
        relationDistance: wu.relationDistance,
        relationType: wu.relationType,

    }
}

function create_interchange_hash_bk(int_hash, wu) {

    if (int_hash.hasOwnProperty(wu.interchange_sku)) {
        int_hash[wu.interchange_sku].interchanges[wu.sku] = {
            partId: wu.sku,
            attributes: wu.attributes
        };
    } else {
        let i = {};
        i[wu.sku] = {
            partId: wu.sku,
            attributes: wu.attributes
        };
        int_hash[wu.interchange_sku] = {
            partId: wu.interchange_sku,
            attributes: wu.interchange_attributes,
            interchanges: i,
            relationDistance: wu.relationDistance,
            relationType: wu.relationType,

        }
    }
}

function group_directs_simple(wus) {
    let dir_hash = {};
    wus.filter(wu => {
        return wu.edge_type === 'direct'
    }).forEach(wu => {
        dir_hash[wu.sku] = create_item(wu)
    });
    return dir_hash;
}

function group_interchanges_simple_old(wus) {
    let int_hash = {};
    wus.filter(wu => {
        return wu.edge_type === 'interchange' && wu.type === 'part'
    }).forEach(wu => {
        create_interchange_hash_fw(int_hash, wu);
        create_interchange_hash_bk(int_hash, wu)
    });
    return int_hash;
}

function group_all_simple(dirs, ints) {
    let dirs_keys = Object.keys(dirs),
        ints_keys = Object.keys(ints);
    dirs_keys.forEach(k => {
        if (ints.hasOwnProperty(k)) {
            dirs[k]['interchanges'] = {};
            Object.keys(ints[k].interchanges).forEach(key => {
                dirs[k]['interchanges'][key] = ints[k].interchanges[key];
            })
        }
    });
    Object.keys(ints).forEach(k => {
        if (!dirs.hasOwnProperty(k)) {
            dirs[k] = ints[k]
        }
    });
    return dirs
}

function prep_response_simple(items_hash) {
    return Object.values(items_hash).map(v => {
            if (v.hasOwnProperty('interchanges')) {
                v.interchanges = Object.values(v.interchanges);
            }
            return v;
        }
    )
}

let groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


function group_by_header(items) {
    let ints = items.filter(i =>i.hasOwnProperty('interchange_header') &&  i.interchange_header.length > 1);
    return groupBy(ints, 'interchange_header');
}


function expand_headers(int_headers) {
    let int_hash = {};
    Object.values(int_headers).forEach(hh => {
        let t_hash = {};
        hh.forEach(h => {
            t_hash[h.sku] = {
                sku: h.sku,
                attributes: h.attributes,
                relationDistance: h.relationDistance,
                relationType: h.relationType
            };
            t_hash[h.interchange_sku] = {
                sku: h.interchange_sku,
                attributes: h.interchange_attributes,
                relationDistance: h.relationDistance,
                relationType: h.relationType
            };
        });
        Object.keys(t_hash).forEach(k => {
            int_hash[k] = t_hash[k];
            let t_hash_cp = JSON.parse(JSON.stringify(t_hash));
            delete  t_hash_cp[k];
            Object.values(t_hash_cp).forEach(v => delete v.interchanges);
            int_hash[k].interchanges = t_hash_cp;
        })
    });
    return int_hash
}

function group_interchanges_simple(items) {
    let int_headers = group_by_header(items);
    return expand_headers(int_headers);
}

function find_where_used_simple(req, res) {
    WhereUsedModel.findWhereUsedCassandraSimple(req.params.id).then(r => {
        let items = r.filter(i => i.type !== 'header');
        items = items.filter(i=> i.type!=='Created' || i.attributes!=="");
        let ds = group_directs_simple(items);
        let is = group_interchanges_simple(items);
        let all = group_all_simple(ds, is);
        let response = prep_response_simple(all);
        res.set('Connection', 'close');
        res.json(response);

    }, err => {
        res.send("There was a problem adding the information to the database. " + err);
    });
}


exports.findWhereUsedCassandraTest = where_used_cassandra;
exports.findWhereUsedCassandra = findWhereUsedCassandra;
exports.findWhereUsedCassandraSimple = find_where_used_simple;
exports.group_directs_simple = group_directs_simple;
exports.group_interchanges_simple = group_interchanges_simple;
exports.group_all_simple = group_all_simple;
exports.prep_response_simple = prep_response_simple;


