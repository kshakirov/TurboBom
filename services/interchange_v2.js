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

const find = async (id) => ({
    headerId: (await interchangeModel.findHeaderByItemId(id))[0].key,
    parts: await interchangeModel.find(id)
});

const findEcommerce = async (id) => (await interchangeModel.find(id)).map(it => convertPartForEcommerce(it));

const findPage = async (id, offset, limit) => ({
    headerId: (await interchangeModel.findHeaderByItemId(id))[0].key,
    parts: await interchangeModel.findPage(id, offset, limit)
});

const findByHeaderId = async (headerId) => await interchangeModel.findByHeaderId(headerId);

const leaveInterchangeGroup = async (id) => {
    let oldHeaderId = (await interchangeModel.findHeaderByItemId(id))[0].key;
    await interchangeModel.remove(oldHeaderId + '_' + id);
    let headerId = (await interchangeModel.createHeader())._key;
    await interchangeModel.add({
        _key: headerId.toString() + '_' + id.toString(),
        type: 'interchange',
        _from: 'interchange_headers/' + headerId,
        _to: 'parts/' + id
    });
    return headerId;
};

const leaveGroup = async (itemId) => {
    let response = {success: true};
    let oldHeaderId = (await interchangeModel.findHeaderByItemId(itemId))[0].key;
    response.oldHeaderId = parseInt(oldHeaderId);
    let newHeaderId = (await leaveInterchangeGroup(itemId));
    response.newHeaderId = parseInt(newHeaderId);
    let logData = (await interchangeLog.leave(itemId, oldHeaderId, newHeaderId));
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
}

const addInterchangeToGroupHelper = async (inItemId, outItemId) => {
    let inHeader = (await interchangeModel.findHeaderByItemId(inItemId));
    let outHeader = (await interchangeModel.findHeaderByItemId(outItemId));
    let outOutput = await interchangeModel.remove(outHeader[0].key, outItemId);
    let inOutput = await interchangeModel.add({
        _key: inHeader[0].key.toString() + '_' + outItemId.toString(),
        type: 'interchange',
        _from: 'interchange_headers/' + inHeader[0].key,
        _to: 'parts/' + outItemId
    });
    return [outOutput, inOutput];
};

const mergeItemGroupToAnotherItemGroup = async (id, pickedId) => {
    let interchanges = (await interchangeModel.find(pickedId));
    let tuples = interchanges.map(it => addInterchangeToGroupHelper(id, it.partId));
    tuples.push(addInterchangeToGroupHelper(id, pickedId));
    return tuples;
}

const mergeToAnotherItemGroup = async (itemId, pickedId) => {
    let response = {success: true};
    let ids = [parseInt(itemId), parseInt(pickedId)];
    let oldHeaderId = (await interchangeModel.findHeaderByItemId(pickedId))[0].key;
    (await interchangeModel.find()).forEach(function (interchange) {
        ids.push(interchange.partId);
    });
    await mergeItemGroupToAnotherItemGroup(itemId, pickedId);
    let newHeaderId = await interchangeModel.findHeaderByItemId(itemId);

    response.newHeaderId = parseInt(newHeaderId[0]);
    response.oldHeaderId = parseInt(oldHeaderId);
    let logData = (await interchangeLog.merge(Array.from(ids), oldHeaderId, response.newHeaderId, 'addGroup'));
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
};

const addToGroup = async (outItemId, inItemId) => {
    let response = {success: true};
    let actions = [];
    let oldHeaderId = (await interchangeModel.findHeaderByItemId(outItemId))[0].key;
    actions.push(await interchangeModel.findHeaderByItemId(inItemId));
    actions.push(await addInterchangeToGroupHelper(inItemId, outItemId));
    response.newHeaderId = parseInt(actions[0][0].key);
    response.oldHeaderId = parseInt(oldHeaderId);
    let logData = await interchangeLog.add(outItemId, inItemId, oldHeaderId, actions[0][0].key);
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
}

exports.find = find;
exports.findEcommerce = findEcommerce;
exports.findByHeaderId = findByHeaderId;
exports.findPage = findPage;
exports.leaveGroup = leaveGroup;
exports.mergeToAnotherItemGroup = mergeToAnotherItemGroup;
exports.addToGroup = addToGroup;