var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

var edges_collection_name = dbConfig.bomEdgesCollection;

module.exports = {
    findBom: function (id, depth=1) {
        var query = `FOR v, e, p IN 1..${depth} OUTBOUND 'parts/${id}' GRAPH '${dbConfig.graph}'
  FILTER p.edges[0].type == "direct"
  RETURN {
        "partId" : p.vertices[1].partId,
        "partNumber" : p.vertices[1].partNumber,
        "partType" : p.vertices[1].partType,
        "name" : p.vertices[1].name
    
  }
  `;

        return db.query(query).then(function (cursor) {
            console.log("done");
            return cursor.all();
        })
    },

    addBom: function (parent_id, child_id, quantity=0) {
        var edges_collection = db.collection(edges_collection_name);
        var data = {
            _key: parent_id + '_' + child_id,
            type: 'direct',
            quantity: quantity,
            _from: 'parts/' + parent_id,
            _to: "parts/" + child_id
        }
        return edges_collection.save(
            data
        );
    },

    removeBom: function (parent_id, child_id) {
        var edges_collection = db.collection(edges_collection_name);
        var edge_key = parent_id + '_' + child_id;
        return edges_collection.remove(edge_key);
    }
}
