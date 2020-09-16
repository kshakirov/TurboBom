var config = require('config');
var dbConfig = config.get('TurboGraph_v2.dbConfig');
var Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

var findWhereUsedQuery = ` for  p,e,v 
        in 1.._depth inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
       return distinct {
        partId: p._key,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;
var findWhereUsedPageQuery = ` for  p,e,v 
        in 1.._depth inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
        LIMIT _offset, _limit
       return distinct {
        partId: p._key,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

var findWhereUsedEcommerceQuery = ` for  p,e,v 	
        in 1..6 inbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}	
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 && p.attributes	
       return distinct {	
        sku: p._key,
        manufacturer: p.manufacturer,
        partNumber: p.partNumber,
        partType: p.partType,
        description: p.description,
        tiSku: null, 
        tiPartNumber: null,
        turboType: p.attributes.turbo_type,
        turboPartNumbers: [],
        turboModel: null,
        prices: 'login'	
}`;

let findWhereUsed = async (id, depth=5) =>
    (await db.query(findWhereUsedQuery.replace('_id', id).replace('_depth', depth))).all()

let findWhereUsedPage = async (offset, limit, id, depth=5) =>
    (await db.query(findWhereUsedPageQuery.replace('_offset', (offset < 0 || limit < 0) ? 0 : offset).replace('_limit', (offset < 0 || limit < 0) ? 0 : limit).replace('_id', id).replace('_depth', depth))).all()

let findWhereUsedEcommerce = async (id) => (await db.query(findWhereUsedEcommerceQuery.replace('_id', id))).all();


exports.findWhereUsed = findWhereUsed;
exports.findWhereUsedPage = findWhereUsedPage;
exports.findWhereUsedEcommerce = findWhereUsedEcommerce;