var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

var edges_collection_name = dbConfig.bomEdgesCollection;

module.exports = {
    findBom: function (id, depth=40) {
        var query = `for  p,e,v 
        in 1..${depth} outbound 'parts/${id}' bom_edges, any interchange_edges
        filter !(e.type=='direct' && v.edges[-2].type =='interchange')
        
       return distinct {
        partId: p._key,
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        qty: e.quantity,
        type: p.type,
        partType: p.partType,
        partNumber: p.partNumber,
        manufacturer: p.manufacturer,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

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
