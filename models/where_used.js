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


module.exports = {
    findWhereUsed: find_where_used
};
