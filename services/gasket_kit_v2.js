let interchangeModel = require('../models/interchanges_v2');
let tokenTools = require('../tools/token_tools');
let gasketKitModel = require('../models/gasket_kits_v2');

const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

let hidePrices = (mc) => mc.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (mc, user_data) =>
    mc.map(b => {
        if (b.group_prices != null) {
            b.prices = b.group_prices[user_data.customer.group]
        }
        return b;
    })

let addPrice = (mc, authorization) => {
    let token = tokenTools.getToken(authorization);
    if (token) {
        let userData = tokenTools.verifyToken(token);
        if(userData) {
            return flattenPrice(mc, userData);
        }
    }
    return hidePrices(mc);
}

let convertTurboResponse = (turbos) => turbos.map(it => {
    let tiPart = (it.interchanges.find(i => i.manufacturer == 'Turbo International'));
    return {
        'id': it.sku,
        'part_number': it.partNumber,
        'ti_id': tiPart ? tiPart.sku : '',
        'ti_part_number': tiPart ? tiPart.partNumber : '',
        'description': it.description,
        'interchanges': it.interchanges.map(i => { return {'part_number': i.partNumber }} ),
        'manufacturer': it.manufacturer,
        'turbo_type': it.turboAttributes.turboType
    };
});

const GASKET_KIT_PREFIX = 'gasket_kit_';
let findTurbosForGasketKit = async (req, res) => {
    let value = await redisClient.get(GASKET_KIT_PREFIX + req.params.id);
    if(!value || JSON.parse(value).length == 0) {
        let gasketKitPartNumber = await gasketKitModel.getGasketKitPartNumberById(parseInt(req.params.id));
        let turbos = await gasketKitModel.getTurbosByGasketKitPartNumber(gasketKitPartNumber[0]);
        let interchanges = await Promise.all(turbos.map(turbo => interchangeModel.find(turbo.partId)));
        turbos.forEach((turbo, index) => {
            turbo.interchanges = interchanges[index] ? interchanges[index] : [];
        });
        value = convertTurboResponse(turbos);
        await redisClient.set(GASKET_KIT_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
    } else {
        value = JSON.parse(value);
    }

    res.json(value);
}

let convertGasketKitResponse = (gasketKits) => gasketKits.map(it => {
    let tiPart = (it.interchanges.find(i => i.manufacturer == 'Turbo International'));

    return {
        'id': it.sku,
        'part_number': it.partNumber,
        'ti_id': tiPart ? tiPart.sku : '',
        'ti_part_number': tiPart ? tiPart.partNumber : '',
        'description': it.description,
        'interchanges': it.interchanges.map(i => { return {'part_number': i.partNumber }} ),
        'manufacturer': it.manufacturer,
        'prices': it.prices
    };
});

const GASKET_KIT_TURBO_PREFIX = 'gasket_kit_turbo_';
let findGasketKitForTurbo = async (req, res) => {
    let value = await redisClient.get(GASKET_KIT_TURBO_PREFIX + req.params.id);
    if(!value || JSON.parse(value).length == 0) {
        let gasketKitPartNumbers = (await gasketKitModel.getGasketKitPartNumberByTurboId(parseInt(req.params.id)));
        let gasketKits = await gasketKitModel.getGasketKitByPartNumber(gasketKitPartNumbers[0]);
        let interchanges = await Promise.all(gasketKits.map(gasketKit => interchangeModel.find(gasketKit.partId)));
        gasketKits.forEach((gasketKit, index) => {
            gasketKit.interchanges = interchanges[index] ? interchanges[index] : [];
        });
        addPrice(gasketKits, req.headers.authorization);
        gasketKits = convertGasketKitResponse(gasketKits);
        value = gasketKits[0];
        if(value) {
            await redisClient.set(GASKET_KIT_TURBO_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
        }

    } else {
        value = JSON.parse(value ? {} : value);
    }
    res.json(value);
}

exports.findGasketKitForTurbo = findGasketKitForTurbo;
exports.findTurbosForGasketKit = findTurbosForGasketKit;