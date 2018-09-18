let interchange_model = require('../models/interchanges'),
    client = require('node-rest-client-promise').Client(),
    config = require('config'),
    metadata = config.get('TurboGraph.metadata');


function add_turbo_interchange(turbos) {
    let skus = turbos.map(t => {
        return {sku: parseInt(t.id || t.ti_id)}
    });
    return Promise.all(skus.map(s => interchange_model.findInterchange(s.sku)
    )).then(promises => {
        console.log(promises);
        let i_turbos = promises.map((x, xi) => (
            {
                interchanges: skus[xi],
                part: x
            }
        ));
        return i_turbos;
    }, error => {
        return false;
    })

}


function rem_duplicates(turbos) {
    let skus_hash = {};
    return turbos.filter(t => {
        if (skus_hash.hasOwnProperty(t.id)) {
            return false;
        } else {
            skus_hash[t.id] = true;
            return false
        }
    })
}

function get_turbos(skus) {
    let url = `http://${metadata.host}:${metadata.port}/product/gasket_kit/`,
        args = {
            data: skus,
            headers: {"Content-Type": "application/json"}
        };
    return client.postPromise(url, args).then(response => {
        rem_duplicates(response.data);
        return add_turbo_interchange(response.data).then(r => {
            if (r) {
                return r;
            }
            return false;
        });
    }, error => {
        console.log(error.msg);
        return false;
    })
}

function find_gasket_kit_base(sku) {
    return interchange_model.findInterchange(sku).then(interchanges => {
        let skus = interchanges.map(i => i.sku);
        skus.push(sku);
        return get_turbos(skus).then(r => {
            if (r) {
                return r;
            }
        });

    })
}

exports.findGasketKitBase = find_gasket_kit_base;
