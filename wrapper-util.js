const redisService = require('./service/redis.service');

module.exports ={
    redisInterchangeHeaderId : (id) => 'interchange_header_' + id,
    redisInterchangeId: (id) => 'interchange_' + id,
    redisInterchangeEcommerceId: (id) => 'interchange_ecommerce_' + id,

    pId : (req) => ([req.params.id]),
    pIdPage : (req) => ([req.params.id, req.params.offset, req.params.limit]),
    pHeaderId : (req) => [req.params.header_id],
    pIdHeaderId : (req) => ([req.params.header_id, req.params.id]),

    wrapper : async (req, res, controlFunction, controlParamFunction, redisParamFunction) => {
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