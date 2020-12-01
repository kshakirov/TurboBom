let whereUsedModel = require('../models/where_used_v2');
let tokenTools = require('../tools/token_tools');
const redisService = require('../service/redis.service');

let filterHeaders = (whereUsed) => whereUsed.filter(used => (used.type !== 'header' && used.type !== 'Created'));

let convertToDto = (whereUseds) =>
    filterHeaders(whereUseds).map((p) => {
        return {
            partId: parseInt(p.partId),
            relationDistance: p.relationDistance,
            relationType: p.relationType
        }
    })

const WHERE_USED_PREFIX = 'where_used_';
let findWhereUsed = async (req, res) => {
    try {
        let value = await redisService.getItem(WHERE_USED_PREFIX + req.params.header_id);
        if(!value || JSON.parse(value).length == 0) {
            value = convertToDto(await whereUsedModel.findWhereUsed([req.params.id], 5));
            await redisService.setItem(WHERE_USED_PREFIX + req.params.header_id, JSON.stringify(value));
        } else {
            value = JSON.parse(value);
        }
        res.json(value);
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
    return Object.values(result);
}

let filterTurboInterchanges = (recs) =>
    recs.filter(
            rec => rec.type === 'part' &&
            rec.edge_type === 'interchange' &&
            rec.interchange !== null &&
            rec.interchange.part_type === 'Turbo' &&
            rec.partType === 'Turbo')
        .map(ti => {
        return {
            header: ti.interchange_header,
            turbos: [
                ti.partNumber,
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
        r.turboPartNumbers = numbers.size > 0 ? Array.from(numbers): [];
        return r;
    });
}

let getTurboPartNumbers = (group) => group.map(g => g.partNumber);

let getTiPartPrice = (p) => p.manufacturer == 'Turbo International' ? p.prices : false;

let getTiPartforPart = (pairs, groups, partNumber) =>
    pairs.find(pair => {
        let group = groups.find(it => it.has(pair.partNumber));
        return group && pair.manufacturer == 'Turbo International' && group.has(partNumber)
    });

let prepResponse = (pairs, turboGroups, groups) => {
    return pairs.map(p => {
        let group = turboGroups.filter(g => {
            if (g.bom_sku == p.sku || g.bom_sku == p.interchange_sku)
                return true;
        });
        let tiPart = getTiPartforPart(pairs, groups, p.partNumber);
        return {
            description: '',
            manufacturer: p.manufacturer,
            partType: p.partType,
            sku: parseInt(p.sku),
            tiSku: tiPart ? p.sku != tiPart.sku ? parseInt(tiPart.sku) : null : null,
            partNumber: p.partNumber,
            tiPartNumber: tiPart ? p.sku != tiPart.sku ? tiPart.partNumber : null : null,
            turboPartNumbers: getTurboPartNumbers(group),
            prices: getTiPartPrice(p),
            turboType: p.turboType,
            turboModel: p.turboModel
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

const WHERE_USED_ECOMMERCE_PREFIX = 'where_used_ecommerce_';
let findWhereUsedEcommerce = async (req, res) => {
    try {
        let authorization = req.headers.authorization || false;
        let value = await redisService.getItem(WHERE_USED_ECOMMERCE_PREFIX + req.params.id);
        if(!value || JSON.parse(value).length == 0) {
            let whereUsed = await whereUsedModel.findWhereUsedEcommerce(req.params.id);
            whereUsed = whereUsed.filter(it => it.partType == 'Turbo' || it.partType == 'Cartridge');
            let whereUsedSet = [];
            whereUsed.forEach(whereUsed => {
                if(!whereUsedSet.find(it => it.sku == whereUsed.sku)) {
                    whereUsedSet.push(whereUsed);
                }
            });
            let group = groupByHeader(filterTurboInterchanges(whereUsed));
            whereUsed = whereUsedSet;
            let pairs = whereUsed, turboGroups = whereUsed;
            let resp = addTurbos(prepResponse(pairs, turboGroups, group), group);

            value = addPrice(resp, authorization); //packFullResponse(addPrice(resp, authorization));
            let objValue = {};
            value.forEach(it => {
                objValue[it.sku] = it;
            });
            value = objValue;
            await redisService.setItem(WHERE_USED_ECOMMERCE_PREFIX + req.params.id, JSON.stringify(value));
        } else {
            value = JSON.parse(value);
        }
        res.set('Connection', 'close');
        res.json(value);
    } catch(err) {
        res.send('There was a problem adding the information to the database. ' + err);
    }
}

exports.findWhereUsed = findWhereUsed;
exports.findWhereUsedPage = findWhereUsedPage;
exports.findWhereUsedEcommerce = findWhereUsedEcommerce;


