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

function group_all(dirs, ints, r_ints) {
    let dirs_keys = Object.keys(dirs),
        ints_keys = Object.keys(ints);
    dirs_keys.forEach(k => {
        if (ints.hasOwnProperty(k)) {
            dirs[k]['interchanges'] = ints[k].interchanges;
        }
    });
    console.log(`Count ${Object.keys(dirs).length}`);
    r_ints.forEach(k => {
        if (!dirs.hasOwnProperty(k)) {
            //console.log(`Missed ${k}`)
        }
    })

}

function check_direct_interchanges(raw) {
    let r_ints_hash = {},
        r_ints = raw.filter(r => {
            return r.edge_type === 'interchange' && r.header_id === false
                && (r.relationDistance === 1 || r.relationDistance === 3)
        });
    r_ints.forEach(r =>{
        r_ints_hash[r.bomPartId] = {
            attributes: r.attributes,
            sku: r.sku,
            relationDistance: r.relationDistance,
            relationType: r.relationType

        }
    });
    return r_ints_hash;
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


WhereUsedCassandra.findWhereUsedCassandraExt(47808).then(r => {
    write_to_file("raw_ints.json", check_direct_interchanges(r));
    write_to_file("raw.json", r);
    let is = group_interchanges(r);
    write_to_file("interchanges.json", is);
    let iis = regroup_interchanges(is);
    write_to_file("n_interchanges.json", iis);
    let ds = group_directs(r);
    write_to_file("directs.json", ds);
    group_all(ds, iis);
    write_to_file("final.json", ds);

});
