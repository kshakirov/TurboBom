let whereUsedModel = require('../models/where_used_v2');

let filterHeaders = (whereUsed) => whereUsed.filter(used => (used.type !== 'header' && used.type !== 'Created'));

let convertToDto = (whereUseds) =>
    filterHeaders(whereUseds).map((p) => {
        return {
            partId: parseInt(p.partId),
            relationDistance: p.relationDistance,
            relationType: p.relationType
        }
    })

let findWhereUsed = async (req, res) => {
    try {
        let whereUsed = await whereUsedModel.findWhereUsed([req.params.id], 5);
        res.json(convertToDto(whereUsed));
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

let findWhereUsedPage = async (req, res) => {
    try {
        let whereUsed = await whereUsedModel.findWhereUsedPage(req.params.offset, req.params.limit, [req.params.id], 5);
        res.json(convertToDto(whereUsed));
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

let findWhereUsedCassandra = async (req, res) => {
    try {
        let whereUsed = await whereUsedModel.findWhereUsedCassandra(req.params.id);
        res.json(whereUsed);
    } catch(e) {
        res.send('There was a problem adding the information to the database. ' + e);
    }
}

exports.findWhereUsed = findWhereUsed;
exports.findWhereUsedPage = findWhereUsedPage;
exports.findWhereUsedCassandra = findWhereUsedCassandra;


