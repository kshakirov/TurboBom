const interchangeModel = require('../../models/interchange/interchanges_v2');
const interchangeLog = require('../interchange-log');


const addToGroupHelper = async (inItemId, outItemId) => {
    const [inHeader, outHeader] = await Promise.all([interchangeModel.findHeaderByItemId(inItemId), interchangeModel.findHeaderByItemId(outItemId)]);
    const outOutput = await interchangeModel.remove(outHeader[0].key, outItemId);
    const inOutput = await interchangeModel.add({
        _key: inHeader[0].key.toString() + '_' + outItemId.toString(),
        type: 'interchange',
        _from: 'interchange_headers/' + inHeader[0].key,
        _to: 'parts/' + outItemId
    });
    return [outOutput, inOutput];
};

const mergeGroupToAnotherGroup = async (id, pickedId) => {
    const interchanges = (await interchangeModel.find(pickedId));
    const tuples = interchanges.map(it => addToGroupHelper(id, it.partId));
    tuples.push(addToGroupHelper(id, pickedId));
    return tuples;
}

const mergeToAnotherGroup = async (itemId, pickedId) => {
    const response = {success: true};
    const ids = [parseInt(itemId), parseInt(pickedId)];
    const oldHeaderId = (await interchangeModel.findHeaderByItemId(pickedId))[0].key;
    (await interchangeModel.find(pickedId)).forEach(function (interchange) {
        ids.push(interchange.partId);
    });
    await mergeGroupToAnotherGroup(itemId, pickedId);
    const newHeaderId = await interchangeModel.findHeaderByItemId(itemId);

    response.newHeaderId = parseInt(newHeaderId[0]);
    response.oldHeaderId = parseInt(oldHeaderId);
    const logData = (await interchangeLog.merge(Array.from(ids), oldHeaderId, response.newHeaderId, 'addGroup'));
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
};

const addToGroup = async (outItemId, inItemId) => {
    const response = {success: true};
    const [oldHeaders, newHeader] = await Promise.all((interchangeModel.findHeaderByItemId(outItemId)), interchangeModel.findHeaderByItemId(inItemId), addToGroupHelper(inItemId, outItemId));
    const oldHeaderId = oldHeaders[0].key;
    response.newHeaderId = parseInt(newHeader[0].key);
    response.oldHeaderId = parseInt(oldHeaderId);
    const logData = await interchangeLog.add(outItemId, inItemId, oldHeaderId, newHeader[0].key);
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
}
exports.mergeToAnotherItemGroup = mergeToAnotherGroup;
exports.addToGroup = addToGroup;