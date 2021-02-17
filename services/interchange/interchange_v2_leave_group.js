let interchangeModel = require('../../models/interchanges/interchanges_v2');
let interchangeLog = require('../../models/interchange-log');

const wireDependencies = (iModel, iLog) => {
    interchangeModel = iModel;
    interchangeLog = iLog;
}

const leaveGroup = async (itemId) => {
    const response = {success: true};
    const oldHeaderId = (await interchangeModel.findHeaderByItemId(itemId))[0].key;
    await interchangeModel.remove(oldHeaderId + '_' + itemId);
    const newHeaderId = (await interchangeModel.createHeader())._key;
    await interchangeModel.add({
        _key: newHeaderId.toString() + '_' + itemId.toString(),
        type: 'interchange',
        _from: 'interchange_headers/' + newHeaderId,
        _to: 'parts/' + itemId
    });
    response.oldHeaderId = parseInt(oldHeaderId);
    response.newHeaderId = parseInt(newHeaderId);
    const logData = (await interchangeLog.leave(itemId, oldHeaderId, newHeaderId));
    response.description = logData.description;
    response.transactionId = logData.transactionId;
    return response;
}

exports.leaveGroup = leaveGroup;
exports.wireDependencies = wireDependencies;