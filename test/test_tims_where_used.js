let WhereUsedCassandra = require('../models/where_used');


function create_item(wu) {
    return {
        attributes: wu.attributes,
        relationDistance: wu.relationDistance,
        relationType: wu.relationType,
        sku: wu.sku

    }
}

function group_interchanges(wus) {
    let int_hash = {};
    wus.filter(wu => {
        return wu.interchange_header !== null && wu.interchange_header !== undefined && wu.interchange_header
    }).forEach(wu => {
        if (int_hash.hasOwnProperty(wu.interchange_header)) {
            int_hash[wu.interchange_header][wu.sku] = create_item(wu);
        } else {
            int_hash[wu.interchange_header] = {};
            int_hash[wu.interchange_header][wu.sku] = create_item(wu);
        }
    });
    return int_hash;
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function regroup_interchanges(ints) {
    let ints_hash = {};
    Object.keys(ints).forEach(header => {
        let skus = Object.keys(ints[header]);
        if (skus.length > 1) {
            skus.forEach(sk => {
                let new_obj = copy(ints[header]),
                    self = new_obj[sk];
                delete  new_obj[sk];
                ints_hash[sk] = {
                    attributes: self.attributes,
                    interchanges: new_obj,
                    relationDistance: self.relationDistance,
                    relationType: self.relationType
                }
            })
        } else if (skus.length === 1) {
            let self = ints[header][skus[0]];
            ints_hash[skus[0]] = {
                attributes: self.attributes,
                interchanges: false,
                relationDistance: self.relationDistance,
                relationType: self.relationType
            }
        }
    });
    return ints_hash;
}

function group_directs(wus) {
    let dir_hash = {};
    wus.filter(wu => {
        return wu.edge_type === 'direct'
    }).forEach(wu => {
        dir_hash[wu.sku] = create_item(wu)
    });
    return dir_hash;
}


function create_interchange_hash_fw(int_hash, wu) {
    let i = {};
    i[wu.interchange_sku] = {
        sku: wu.interchange_sku,
        attributes: wu.interchange_attributes
    };
    int_hash[wu.sku] = {
        sku: wu.sku,
        attributes: wu.attributes,
        interchanges: i,
        relationDistance: wu.relationDistance,
        relationType: wu.relationType,

    }
}

function create_interchange_hash_bk(int_hash, wu) {

    if (int_hash.hasOwnProperty(wu.interchange_sku)) {
        int_hash[wu.interchange_sku].interchanges[wu.sku] = {
            sku: wu.sku,
            attributes: wu.attributes
        };
    } else {
        let i = {};
        i[wu.sku] = {
            sku: wu.sku,
            attributes: wu.attributes
        };
        int_hash[wu.interchange_sku] = {
            sku: wu.interchange_sku,
            attributes: wu.interchange_attributes,
            interchanges: i,
            relationDistance: wu.relationDistance,
            relationType: wu.relationType,

        }
    }
}


function group_interchanges_simple(wus) {
    let int_hash = {};
    wus.filter(wu => {
        return wu.edge_type === 'interchange' && wu.type === 'part'
    }).forEach(wu => {
        create_interchange_hash_fw(int_hash, wu);
        create_interchange_hash_bk(int_hash, wu)
    });
    return int_hash;
}


function group_all(dirs, ints, r_ints) {
    let dirs_keys = Object.keys(dirs),
        ints_keys = Object.keys(ints);
    dirs_keys.forEach(k => {
        if (ints.hasOwnProperty(k)) {
            dirs[k]['interchanges'] = ints[k].interchanges;
        }
    });
    console.log(`Count ${Object.keys(dirs).length}`);
    Object.keys(r_ints).forEach(k => {
        if (dirs.hasOwnProperty(k)) {
            if (!dirs[k].hasOwnProperty('interchanges')) {
                dirs[k].interchanges = r_ints[k]
            }
        }
    })

}

function check_direct_interchanges(raw) {
    let r_ints_hash = {},
        r_ints = raw.filter(r => {
            return r.edge_type === 'interchange' && r.header_id === false
                && (r.relationDistance === 1 || r.relationDistance === 3)
        });
    r_ints.forEach(r => {
        r_ints_hash[r.bomPartId] = {
            attributes: r.attributes,
            sku: r.sku,
            relationDistance: r.relationDistance,
            relationType: r.relationType

        }
    });
    return r_ints_hash;
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


function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}


// WhereUsedCassandra.findWhereUsedCassandraExt(47778).then(r => {
//     let raw_ints = check_direct_interchanges(r);
//     write_to_file("raw_ints.json", raw_ints);
//     write_to_file("raw.json", r);
//     let is = group_interchanges(r);
//     write_to_file("interchanges.json", is);
//     let iis = regroup_interchanges(is);
//     write_to_file("n_interchanges.json", iis);
//     let ds = group_directs(r);
//     write_to_file("directs.json", ds);
//     group_all(ds, iis,raw_ints);
//     write_to_file("final.json", ds);
//
// });

WhereUsedCassandra.findWhereUsedCassandraSimple(47778).then(r => {

    let items = r.filter(i => i.type !== 'header');
    console.log(`Count: ${items.length}`);
    write_to_file("simple_raw.json", items);
    let ds = group_directs(items);
    console.log(`Count Directs: ${Object.keys(ds).length}`);
    write_to_file("direct_simple.json", ds);
    let is = group_interchanges_simple(items);
    console.log(`Count Interchanges: ${Object.keys(is).length}`);
    write_to_file("interchange_simple.json", is);
    let all = group_all_simple(ds, is);
    console.log(`Count Interchanges: ${Object.keys(all).length}`);
    write_to_file("all_simple.json", all);

});
