var config = require('config');
var dbConfig = config.get('TurboGraph_v2.dbConfig');
var Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

var findWhereUsedQuery = ` for  p,e,v 
        in 1.._depth inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 && !p.inactive 
       return distinct {
        partId: p._key,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;
var findWhereUsedPageQuery = ` for  p,e,v 
        in 1.._depth inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 && !p.inactive
        LIMIT _offset, _limit
       return distinct {
        partId: p._key,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;
// var findWhereUsedCassandraQuery = ` for  p,e,v
//         in 1..6 inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
//         filter   count(remove_value(v.edges[*].type,'interchange')) > 0 && p.attributes && !p.inactive
//         && (p.attributes.part_type == 'Cartridge' || p.attributes.part_type == 'Turbo')
//         && v.vertices[-3].partId != _id
//        return distinct {
//         prices: p.group_prices,
//         sku: p._key,
//         header_id: p.header || false,
//         bomPartId: v.vertices[-3].partId,
//         attributes: p.attributes,
//         type: p.type || "part",
//         attributes: p.attributes,
//         edge_type: e.type,
//         interchange: v.vertices[-3].attributes,
//         interchange_sku: v.vertices[-3]._key,
//         bom: v.vertices[-2].attributes,
//         bom_sku: v.vertices[-2]._key,
//         interchange_header: v.vertices[-2]._key,
//         relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
//         relationType: count(remove_value(v.edges[*].type,'direct')) == 0
// }`;
var findWhereUsedCassandraQuery = ` for  p,e,v 
        in 1..6 inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 && !p.inactive 
        && v.vertices[-3].partId != _id
       return distinct {
        prices: p.group_prices,
        sku: p._key,
        header_id: p.header || false,
        bomPartId: v.vertices[-3].partId,
        attributes: {'manufacturer': p.manufacturer, 'part_number': p.partNumber, 'part_type': p.partType, 'turbo_type': p.turboAttributes.turboType, 'turbo_model': p.turboAttributes.turboModel},
        type: p.type || "part",
        edge_type: e.type,
        interchange: {'part_type': v.vertices[-3].partType, 'part_number': v.vertices[-3].partNumber},
        interchange_sku: v.vertices[-3]._key,  
        bom: v.vertices[-2].attributes,
        bom_sku: v.vertices[-2]._key,
        interchange_header: v.vertices[-2]._key,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

let findWhereUsed = async (id, depth=5) =>
    (await db.query(findWhereUsedQuery.replace('_id', id).replace('_depth', depth))).all()

let findWhereUsedPage = async (offset, limit, id, depth=5) =>
    (await db.query(findWhereUsedPageQuery.replace('_offset', (offset < 0 || limit < 0) ? 0 : offset).replace('_limit', (offset < 0 || limit < 0) ? 0 : limit).replace('_id', id).replace('_depth', depth))).all()


let findWhereUsedEcommerce = async (id) => (await db.query(findWhereUsedCassandraQuery.replace('_id', id).replace('_id', id))).all();

exports.findWhereUsed = findWhereUsed;
exports.findWhereUsedPage = findWhereUsedPage;
exports.findWhereUsedEcommerce = findWhereUsedEcommerce;