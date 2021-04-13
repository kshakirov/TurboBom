const aIndex = require('../../services/alternative_bom/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findAltBom: W.execute(aIndex.findService.findAltBom, params.pParentIdChildId, redisKeys.altBomParentChild),
    findAltBomPage: W.execute(aIndex.findService.findAltBomPage, params.pOffsetLimitParentIdChildId, null),

    removeAltBom: W.execute(aIndex.writeService.removeAltBom, params.pPartIdHeaderId, null),
    addAltBom: W.execute(aIndex.writeService.addAltBom, params.pParentChildPartAltHeader, null),
    addAltGroup: W.execute(aIndex.writeService.addAltGroup, params.pParentChildAltHeader, null),
    removeAltGroup: W.execute(aIndex.writeService.removeAltGroup, params.pAltHeader, null)
}