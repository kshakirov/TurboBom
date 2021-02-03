module.exports = {
    redisInterchangeHeaderId: (id) => 'interchange_header_' + id,
    redisInterchangeId: (id) => 'interchange_' + id,
    redisInterchangeEcommerceId: (id) => 'interchange_ecommerce_' + id,

    redisBomEcommerceId: (id) => 'bom_ecommerce_' + id,
    redisBomId: (id) => 'bom_' + id,
    redisBomOnlyId: (id) => 'bom_only_' + id,
    redisBomChildId: (id) => 'bom_child_' + id,
}