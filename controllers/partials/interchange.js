const interchange = require('../../services/interchange_v2');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findByHeaderId: W.execute(interchange.findByHeaderId, params.pHeaderId, redisKeys.interchangeHeaderId),
    find: W.execute(interchange.find, params.pId, redisKeys.interchangeId),
    findEcommerce: W.execute(interchange.findEcommerce, params.pId, redisKeys.interchangeEcommerceId),
    findPage: W.execute(interchange.findPage, params.pIdPage, null),
    leaveGroup: W.execute(interchange.leaveGroup, params.pItemId, null),
    mergeToAnotherItemGroup: W.execute(interchange.mergeToAnotherItemGroup, params.pItemIdPickedId, null),
    addToGroup: W.execute(interchange.addToGroup, params.pOutItemIdInItemId, null)
}