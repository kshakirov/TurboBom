let config = require('config');
let dbConfig = config.get('TimmsGraphAttributes.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);


function get_children(graph, collection_name, starting_node) {
    let distance = 10,
        depth = 40,
        query = `FOR v, e, p IN 1..${distance} OUTBOUND '${collection_name}/${starting_node}' GRAPH '${graph}'
  
  RETURN distinct {
    name: v._key
  }`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })

}


exports.getChildren = get_children;
