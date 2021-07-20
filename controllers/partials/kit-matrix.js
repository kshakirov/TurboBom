const iIndex = require('../../services/kit-matrix/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    getKitMatrix: W.execute(iIndex.findService.getKitMatrix, params.pIdAuthorization, redisKeys.kitMatrixId)
}