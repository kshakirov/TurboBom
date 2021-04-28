const wuIndex = require('../../services/where-used/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findWhereUsed: W.execute(wuIndex.findService.findWhereUsed, params.pId, redisKeys.whereUsedId),
    findWhereUsedPage: W.execute(wuIndex.findService.findWhereUsedPage, params.pIdPage, null),
    findWhereUsedEcommerce: W.execute(wuIndex.findService.findWhereUsedEcommerce, params.pIdAuthorizationOffsetLimit, redisKeys.whereUsedEcommerceId),
    findWhereUsedData: W.execute(wuIndex.findService.findWhereUsedData, params.pIdAuthorizationOffsetLimit, redisKeys.whereUsedEcommerceId)
}