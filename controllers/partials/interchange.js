const iIndex = require('../../services/interchange/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findByHeaderId: W.execute(iIndex.findService.findByHeaderId, params.pHeaderId, redisKeys.interchangeHeaderId),
    find: W.execute(iIndex.findService.find, params.pId, redisKeys.interchangeId),
    findEcommerce: W.execute(iIndex.findService.findEcommerce, params.pId, redisKeys.interchangeEcommerceId),
    findPage: W.execute(iIndex.findService.findPage, params.pIdPage, null),
    leaveGroup: W.execute(iIndex.leaveService.leaveGroup, params.pItemId, null),
    mergeToAnotherItemGroup: W.execute(iIndex.interchangeV2.mergeToAnotherItemGroup, params.pItemIdPickedId, null),
    addToGroup: W.execute(iIndex.interchangeV2.addToGroup, params.pOutItemIdInItemId, null)
}