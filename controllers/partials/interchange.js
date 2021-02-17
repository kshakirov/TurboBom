const iIndex = require('../../services/interchange/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findByHeaderId: W.execute(iIndex.interchangeV2.findByHeaderId, params.pHeaderId, redisKeys.interchangeHeaderId),
    find: W.execute(iIndex.interchangeV2.find, params.pId, redisKeys.interchangeId),
    findEcommerce: W.execute(iIndex.interchangeV2.findEcommerce, params.pId, redisKeys.interchangeEcommerceId),
    findPage: W.execute(iIndex.interchangeV2.findPage, params.pIdPage, null),
    leaveGroup: W.execute(iIndex.leaveService.leaveGroup, params.pItemId, null),
    mergeToAnotherItemGroup: W.execute(iIndex.interchangeV2.mergeToAnotherItemGroup, params.pItemIdPickedId, null),
    addToGroup: W.execute(iIndex.interchangeV2.addToGroup, params.pOutItemIdInItemId, null)
}