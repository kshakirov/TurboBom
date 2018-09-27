let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

function find_where_used(id, depth = 40) {
    let query = ` for  p,e,v 
        in 1..40 inbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
       return distinct {
        partId: p._key,
        type: p.type,
        attributes: p.attributes,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function find_where_used_cassandra(id, depth = 40) {
    let query = ` for  p,e,v 
        in 1..40 inbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
       return distinct {
        sku: p._key,
        header_id: p.header || false,
        bomPartId: v.vertices[-3].partId,
        attributes: p.attributes,
        type: p.type || "part",
        attributes: p.attributes,
        edge_type: e.type,
        interchange: v.vertices[-3].attributes,
        interchange_sku: v.vertices[-3]._key,  
        bom: v.vertices[-2].attributes,
        bom_sku: v.vertices[-2]._key,
        interchange_header: v.vertices[-2]._key,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function find_where_used_cassandra_extended(id, depth = 40) {
    let query = ` for  p,e,v
      in 1..40 inbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
       return distinct { 
        sku: p._key,
        header_id: p.header || false,
        bomPartId: p.header? '' :v.vertices[-3].partId,
        attributes: p.attributes,
        type: p.type || "part",
        attributes: p.attributes,
        edge_type: e.type,
        interchange: e.type=='interchange'? v.vertices[-1].attributes :  '',
        interchange_sku: e.type=='interchange'? v.vertices[-1]._key : '',  
        bom: v.vertices[-2].attributes,
        bom_sku: (p.header || e.type=='interchange')? '' : v.vertices[-2]._key,
        interchange_header: (!p.header && e.type=='interchange')? v.vertices[-2]._key: false,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function find_where_used_cassandra_simple(id, depth = 40) {
    let query = ` for  p,e,v
      in 1..40 inbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter   count(remove_value(v.edges[*].type,'interchange')) > 0 
        let is_interchange = e.type=='interchange'
        let is_direct = e.type=='direct'
        let is_header = e.type=='header'
        
       return distinct {
       sku: p._key,
       attributes: p.attributes || '',
       interchange_sku: is_interchange? v.vertices[-3].partId || '' : '',
       interchange_attributes: is_interchange? v.vertices[-3].attributes || '' : '',
       interchange_header: is_interchange? v.vertices[-2]._id: '',
       type: p.type || "part",
       edge_type: e.type,
       relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0
    }`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}



module.exports = {
    findWhereUsed: find_where_used,
    findWhereUsedCassandra: find_where_used_cassandra,
    findWhereUsedCassandraExt: find_where_used_cassandra_extended,
    findWhereUsedCassandraSimple: find_where_used_cassandra_simple
};
