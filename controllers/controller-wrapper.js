const redisService = require('../services/redis.service');

module.exports ={

    execute : (req, res) => async (controlFunction, controlParamFunction, redisParamFunction) => {
        let c_params = controlParamFunction.apply(null, [req]);
        let r_params;
        if(redisParamFunction != null) {
            r_params = redisParamFunction.apply(null, c_params);
            let redisResponse = await redisService.getItem(r_params);
            if(redisResponse &&  JSON.parse(redisResponse).length != 0) {
                res.json(JSON.parse(redisResponse));
                return;
            }
        }
        let value = await controlFunction.apply(null, c_params);
        if(redisParamFunction != null) {
            redisService.setItem(r_params, JSON.stringify(value));
        }
        res.json(value);
    }

}