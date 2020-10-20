const interchangeModel = require('../models/interchanges_v2');
const interchangeLog = require('../models/interchange-log');

const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

const INTERCHANGE_PREFIX = 'interchange_';
let findInterchange = async (req, res) => {
    try {
        let value = await redisClient.get(INTERCHANGE_PREFIX + req.params.id);
        if(!value || JSON.parse(value).length == 0) {
            let header = (await interchangeModel.findInterchangeHeaderByItemId(req.params.id))[0].key;
            let parts = await interchangeModel.findInterchange(req.params.id);
            value = {
                headerId: header,
                parts: parts
            };
            await redisClient.set(INTERCHANGE_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
        } else {
            value = JSON.parse(value);
        }
        res.set('Connection', 'close');

        res.json(value);
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

let convertPartForEcommerce = (part) => ({
    'id': part.sku,
    'manufacturer': part.manufacturer,
    'partType': part.partType,
    'description': part.description,
    'part_number': part.partNumber,
    'inactive': false
});

const INTERCHANGE_ECOMMERCE_PREFIX = 'interchange_ecommerce_';
let findInterchangeEcommerce = async (req, res) => {
    try {
        let value = await redisClient.get(INTERCHANGE_ECOMMERCE_PREFIX + req.params.id);
        if(!value || JSON.parse(value).length == 0) {
            value = (await interchangeModel.findInterchange(req.params.id)).map(it => convertPartForEcommerce(it))
            await redisClient.set(INTERCHANGE_ECOMMERCE_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
        } else {
            value = JSON.parse(value);
        }
        res.set('Connection', 'close');
        res.json(value);
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
};

let findInterchangesPage = async (req, res) => {
    try {
        res.set('Connection', 'close');
        res.json({
            headerId: (await interchangeModel.findInterchangeHeaderByItemId(req.params.id))[0].key,
            parts: await interchangeModel.findInterchangesPage(req.params.id, req.params.offset, req.params.limit)
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

const INTERCHANGE_HEADER_PREFIX = 'interchange_header_';
let findInterchangesByHeaderId = async (req, res) => {
    try {
        let value = await redisClient.get(INTERCHANGE_HEADER_PREFIX + req.params.header_id);
        if(!value || JSON.parse(value).length == 0) {
            value = await interchangeModel.findInterchangesByHeaderId(req.params.header_id);
            await redisClient.set(INTERCHANGE_HEADER_PREFIX + req.params.header_id, JSON.stringify(value), 'EX', redisConfig.ttl);
        } else {
            value = JSON.parse(value);
        }
        res.set('Connection', 'close');
        res.json({
            headerId: parseInt(req.params.header_id),
            parts: value
        });
    } catch(e) {
        res.send(`Arango error: ${e}`);
    }
}

let leaveIntechangeGroup = async (req, res) => {
    try {
        let response = {success: true};
        let oldHeaderId = (await interchangeModel.findInterchangeHeaderByItemId(req.params.item_id))[0].key;
        response.oldHeaderId = parseInt(oldHeaderId);
        let newHeaderId = (await interchangeModel.leaveInterchangeGroup(req.params.item_id));
        response.newHeaderId = parseInt(newHeaderId);
        let logData = (await interchangeLog.leave(req.params.item_id, oldHeaderId, newHeaderId));
        response.description = logData.description;
        response.transactionId = logData.transactionId;
        res.json(response);
    } catch(e) {
        res.json({
            success: false,
            msg: e.message
        });
    }
}

let mergeIterchangeToAnotherItemGroup = async (req, res) => {
    let response = {success: true};
    let ids = [parseInt(req.params.item_id), parseInt(req.params.picked_id)];
    let oldHeaderId = (await interchangeModel.findInterchangeHeaderByItemId(req.params.picked_id))[0].key;
    (await interchangeModel.findInterchange(req.params.picked_id)).forEach(function (interchange) {
        ids.push(interchange.partId);
    });
    await interchangeModel.mergeItemGroupToAnotherItemGroup(req.params.item_id, req.params.picked_id);
    let newHeaderId = await interchangeModel.findInterchangeHeaderByItemId(req.params.item_id);

    response.newHeaderId = parseInt(newHeaderId[0]);
    response.oldHeaderId = parseInt(oldHeaderId);
    let logData = (await interchangeLog.merge(Array.from(ids), oldHeaderId, response.newHeaderId, 'addGroup'));
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    res.json(response);
};

let addInterchangeToGroup = async (req, res) => {
    try {
        let response = {success: true};
        let actions = [];
        let oldHeaderId = (await interchangeModel.findInterchangeHeaderByItemId(req.params.out_item_id))[0].key;
        actions.push(await interchangeModel.findInterchangeHeaderByItemId(req.params.in_item_id));
        actions.push(await interchangeModel.addInterchangeToGroup(req.params.in_item_id, req.params.out_item_id));
        response.newHeaderId = parseInt(actions[0][0].key);
        response.oldHeaderId = parseInt(oldHeaderId);
        let logData = await interchangeLog.add(req.params.out_item_id, req.params.in_item_id, oldHeaderId, actions[0][0].key);
        response.description = logData.description;
        response.transactionId = logData.transactionId;
        res.json(response);
    } catch(e) {
        res.json({
            success: false,
            msg: e.message
        });
    }
}

exports.findInterchange = findInterchange;
exports.findInterchangeEcommerce = findInterchangeEcommerce;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.findInterchangesPage = findInterchangesPage;
exports.leaveIntechangeGroup = leaveIntechangeGroup;
exports.mergeIterchangeToAnotherItemGroup = mergeIterchangeToAnotherItemGroup;
exports.addInterchangeToGroup = addInterchangeToGroup;