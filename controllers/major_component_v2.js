let bomController = require('./bom_v2'),
    distance = 4,
    tokenTools = require('../tools/token_tools'),
    majorComponents = [
    'Compressor Wheel',
    'Turbine Wheel',
    'Bearing Housing',
    'Backplate / Sealplate',
    'Heatshield / Shroud',
    'Nozzle Ring',
    'Actuator',
    'Seal Plate',
    'Cartridge'
];

const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

let isTiPart = (manufacturer) => manufacturer != null && manufacturer.toLowerCase() == 'turbo international';

let addTiPart = (b) => {
    if (b.hasOwnProperty('interchanges') && b.interchanges != null) {
        let ti_part = b.interchanges.find(i => isTiPart(i.manufacturer));
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

let hidePrices = (mc) => mc.map(b => {
    b.prices = 'login';
    return b;
});

let flattenPrice = (mc, user_data) =>
    mc.map(b => {
        if (b.prices != null) {
            b.prices = b.prices[user_data.customer.group]
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

let prepareComponent = (b) => {
    if (!isTiPart(b.manufacturer)) {
        addTiPart(b)
    }
}

let insertNames = (boms) => boms.map(bom => {
    bom.name = bom.part_type + '-' + bom.part_number;
    return bom;
});

let filterMajorComponents = (boms) => boms.filter(b => majorComponents.includes(b.part_type));

let prepareResponse = (boms) => {
    return filterMajorComponents(boms).map(b => {
        prepareComponent(b);
        return b;
    });

}

const MAJOR_COMPONENTS_PREFIX = 'major_components_';
let getMajorComponents = async (req, res) => {
    let value = await redisClient.get(MAJOR_COMPONENTS_PREFIX + req.params.id);
    if(!value || JSON.parse(value).length == 0) {
        let response = prepareResponse((await bomController._findBomEcommerce(req.params.id, distance, req.headers.authorization)));
        //addPrice(response, req.headers.authorization);
        insertNames(response);
        value = response;
        await redisClient.set(MAJOR_COMPONENTS_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
    } else {
        value = JSON.parse(value);
    }
    res.json(value);

}

exports.getMajorComponents = getMajorComponents;