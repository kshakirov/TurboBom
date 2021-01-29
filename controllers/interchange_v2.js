const interchangeModel = require('../models/interchanges_v2');
const interchangeLog = require('../models/interchange-log');

const convertPartForEcommerce = (part) => ({
    'id': part.sku,
    'manufacturer': part.manufacturer,
    'partType': part.partType,
    'description': part.description,
    'part_number': part.partNumber,
    'inactive': false
});

const findInterchange = async (id) => {
    return {
        headerId: (await interchangeModel.findInterchangeHeaderByItemId(id))[0].key,
        parts: await interchangeModel.findInterchange(id)
    };
}

const findInterchangeEcommerce = async (id) => (await interchangeModel.findInterchange(id)).map(it => convertPartForEcommerce(it));

const findInterchangesPage = async (id, offset, limit) => {
    return {
        headerId: (await interchangeModel.findInterchangeHeaderByItemId(id))[0].key,
        parts: await interchangeModel.findInterchangesPage(id, offset, limit)
    };
}

const findInterchangesByHeaderId = async (headerId) => await interchangeModel.findInterchangesByHeaderId(headerId);











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