const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

let getItem = async (id) => {
    if(redisConfig.enabled) {
        return await redisClient.get(id);
    }
    else return null;
}

let setItem = async(id, value) => {
    if(redisConfig.enabled) {
        await redisClient.set(id, value, 'EX', redisConfig.ttl);
    }
}


exports.getItem = getItem;
exports.setItem = setItem;