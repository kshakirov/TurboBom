let whereUsedModel = require('../models/where_used_v2');
let tokenTools = require('../tools/token_tools');

let filterHeaders = (whereUsed) => whereUsed.filter(used => (used.type !== 'header' && used.type !== 'Created'));

let convertToDto = (whereUseds) =>
    filterHeaders(whereUseds).map((p) => {
        return {
            partId: parseInt(p.partId),
            relationDistance: p.relationDistance,
            relationType: p.relationType
        }
    })

let findWhereUsed = async (req, res) => {
    try {
        let whereUsed = await whereUsedModel.findWhereUsed([req.params.id], 5);
        res.json(convertToDto(whereUsed));
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

let findWhereUsedPage = async (req, res) => {
    try {
        let whereUsed = await whereUsedModel.findWhereUsedPage(req.params.offset, req.params.limit, [req.params.id], 5);
        res.json(convertToDto(whereUsed));
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

let groupByHeader = (turboInterchanges) => {
    let result = {};
    turboInterchanges.forEach(ti => {
        if (result.hasOwnProperty(ti.header)) {
            ti.turbos.forEach(it => {
                result[ti.header].add(it);
            })
        } else {
            result[ti.header] = new Set(ti.turbos);
        }
    });
    return Object.values(result).map(s => s.values().next().value);
}

let filterTurboInterchanges = (recs) =>
    recs.filter(
            rec => rec.type === 'part' &&
            rec.edge_type === 'interchange' &&
            rec.interchange !== null &&
            rec.interchange.part_type === 'Turbo' &&
            rec.attributes.part_type === 'Turbo')
        .map(ti => {
        return {
            header: ti.interchange_header,
            turbos: [
                ti.attributes.part_number,
                ti.interchange.part_number
            ]
        };
    });

let addTurbos = (response, turboInterchanges) => {
    return response.map(r => {
        let numbers = new Set(r.turboPartNumbers);
        if(Array.isArray(turboInterchanges)) {
            turboInterchanges.forEach(ti => {
                let sti = new Set(ti);
                sti.forEach(it => {
                    numbers.add(it);
                })
            });
        }
        r.turboPartNumbers = numbers.size > 0 ? Array.from(numbers): null;
        return r;
    });
}

let getTiSku = (p) => p.attributes.manufacturer == 'Turbo International' ? p.sku : p.hasOwnProperty('interchange_sku') ? p.interchange_sku: null;

let getSku = (p) => p.attributes.manufacturer == 'Turbo International' ? p.interchange_sku : p.sku;

let getPartNumber = (p) => {
    if (p.attributes.manufacturer == 'Turbo International' && p.interchange) {
        return p.interchange.part_number;
    }
    if (p.attributes != null && p.attributes.hasOwnProperty('part_number'))
        return p.attributes.part_number;
    else
        return null;
}
let getTiPartNumber = (p) => {
    if (p.attributes.manufacturer == 'Turbo International') {
        return p.attributes.part_number;
    }
    if (p.hasOwnProperty('interchange') && p.interchange !== null)
        return p.interchange.part_number;
    else
        return null;
}

let getTurboPartNumbers = (group) => {
    let tpn = group.filter(g => g.attributes !== null);
    return tpn.map(g => g.attributes.part_number);
}

let getTiPartPrice = (p) => p.attributes.manufacturer == 'Turbo International' ? p.prices : false;

let prepResponse = (pairs, turboGroups) => {
    return pairs.map(p => {
        let group = turboGroups.filter(g => {
            if (g.bom_sku == p.sku || g.bom_sku == p.interchange_sku)
                return true;
        });
        return {
            description: '',
            manufacturer: p.attributes.manufacturer,
            part_type: p.attributes.part_type,
            sku: getSku(p),
            tiSku: getTiSku(p),
            partNumber: getPartNumber(p),
            tiPartNumber: getTiPartNumber(p),
            turboPartNumbers: getTurboPartNumbers(group),
            prices: getTiPartPrice(p),
            header: p.interchange_header
        }
    })
}

let hidePrices = (data) => data.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (data, user_data) =>
    data.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group]
        }
        return b;
    })

let addPrice = (data, authorization) => {
    let token = tokenTools.getToken(authorization);
    if (token) {
        let userData = tokenTools.verifyToken(token);
        if(userData) {
            return flattenPrice(data, userData);
        }
    }
    return hidePrices(data);
}

let packFullResponse = (respFull) => {
    let result = {};
    respFull.forEach(r => {
        if (result.hasOwnProperty(r.tiSku)) {
            result[r.tiSku].turboPartNumbers = new Set(result[r.tiSku].turboPartNumbers, r.turboPartNumbers);
        } else {
            result[r.tiSku] = r;
        }
    });
    return result;
}

let findWhereUsedEcommerce = async (req, res) => {
    try {
        let authorization = req.headers.authorization || false;
        let whereUsed = await whereUsedModel.findWhereUsedEcommerce(req.params.id);
        let group = groupByHeader(filterTurboInterchanges(whereUsed));
        let pairs = whereUsed, turboGroups = whereUsed;
        let resp = addTurbos(prepResponse(pairs, turboGroups), group);
        res.set('Connection', 'close');
        res.json(packFullResponse(addPrice(resp, authorization)));
    } catch(err) {
        res.send('There was a problem adding the information to the database. ' + err);
    }
}

exports.findWhereUsed = findWhereUsed;
exports.findWhereUsedPage = findWhereUsedPage;
exports.findWhereUsedEcommerce = findWhereUsedEcommerce;


