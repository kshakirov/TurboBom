module.exports = {
    pId : (req) => ([req.params.id]),
    pItemId: (req) => ([req.params.item_id]),
    pItemIdPickedId: (req) => ([req.params.item_id, req.params.picked_id]),
    pIdPage : (req) => ([req.params.id, req.params.offset, req.params.limit]),
    pHeaderId : (req) => [req.params.header_id],
    pIdHeaderId : (req) => ([req.params.header_id, req.params.id]),
    pIdAuthorizationDistance : (req) => ([req.params.id, req.headers.authorization, req.query.distance]),
    pIdDistanceDepth : (req) => ([req.params.id, req.query.distance, req.query.depth]),
    pOffsetLimitIdDistanceDepth : (req) => ([req.params.offset, req.params.limit, req.params.id, req.query.distance , req.query.depth]),
    pOutItemIdInItemId : (req) => ([req.params.out_item_id, req.params.in_item_id])
}