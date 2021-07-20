module.exports = {
    interchangeHeaderId: (id) => 'interchange_header_' + id,
    interchangeId: (id) => 'interchange_' + id,
    interchangeEcommerceId: (id) => 'interchange_ecommerce_' + id,

    bomEcommerceId: (id) => 'bom_ecommerce_' + id,
    bomId: (id) => 'bom_' + id,
    bomOnlyId: (id) => 'bom_only_' + id,
    bomChildId: (id) => 'bom_child_' + id,

    altBomParentChild: (parentPartId, childPartId) => 'alt_bom_' + parentPartId + '_' + childPartId,

    whereUsedId: (id) => 'where_used_' + id,
    whereUsedEcommerceId: (id) => 'where_used_ecommerce_' + id,

    kitMatrixId: (id) => 'kit_matrix_' + id,

    serviceKitsId: (id) => 'service_kits_' + id
}