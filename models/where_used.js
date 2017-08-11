var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

function find_where_used(id, depth=40) {
    var query = ` for ${dbConfig.partCollection}
        in 1..40 inbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        options {
            bfs: true,
            uniqueVertices: 'global'
        }
        return distinct parts`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


module.exports = {
    findWhereUsed: find_where_used
}
