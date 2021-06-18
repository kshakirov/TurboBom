const skIndex = require('../../services/service-kits/index');
const redisKeys = require('../redis-keys');
const params = require('../request-params-functions');
const W = require('../controller-wrapper');

module.exports = {
    findServiceKits: W.execute(skIndex.findService.findServiceKits, params.pIdAuthorization, redisKeys.serviceKitsId)
}