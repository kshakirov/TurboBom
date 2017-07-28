Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
var parts_collection_name = 'parts';
var edges_collection_name = 'bom_edges';

module.exports = {
    findBom: function (id) {
        var query = `FOR v, e, p IN 1..1 OUTBOUND 'parts/${id}' GRAPH 'BomGraph'
  FILTER p.edges[0].type == "direct"
  RETURN {
    'parent' : {
        'id' : ${id}
    },
    'child' : {
        'id' : p.vertices[1]._key,
        "manufacturerPartNumber" : p.vertices[1].part_number,
        "type" : p.vertices[1].part_type,
        "name" : p.vertices[1].name
    }
  }
  `;

        return db.query(query).then(function (cursor) {
            console.log("done");
            return cursor.all();
        })
    },

    addBom: function (parent_id, child_id) {
        var edges_collection = db.collection(edges_collection_name);
        var data = {
            _key: parent_id + '_' + child_id,
            type: 'direct',
            test: 1,
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
