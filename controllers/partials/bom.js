const bIndex = require('../../services/bom/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    addBom: W.execute(bIndex.writeService.addBom, params.pParentDescendantQty, null),
    updateBom: W.execute(bIndex.writeService.updateBom, params.pParentDescendantQty, null),
    removeBom: W.execute(bIndex.writeService.removeBom, params.pParentDescendant, null),

    find: W.execute(bIndex.findService.findBom, params.pIdDistanceDepth, null),
    findBomEcommerce: W.execute(bIndex.findService.findBomEcommerce, params.pIdDistanceDepth, null),
    findBomPage: W.execute(bIndex.findService.findBomPage, params.pOffsetLimitIdDistanceDepth, null),
    findOnlyBom: W.execute(bIndex.findService.findOnlyBom, params.pId, null),
    findBomAsChild: W.execute(bIndex.findService.findBomAsChild, params.pId, null)
}