Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
var edges_collection_name = 'interchange_edges';

module.exports = {
    findInterchange: function (id) {
        var query = `FOR v, e, p IN 2..2 ANY 'parts/${id}' GRAPH 'InterchangeGraph'
        FILTER p.edges[0].type == 'interchange'
        RETURN  {
                "id" : p.vertices[2]._key,
                "manufacturerPartNumber" : p.vertices[2].part_number,
                "partType" : { "name" : p.vertices[2].part_type},
                "manufacturer" : {"name" : "not yet name"}
        }`;

        return db.query(query).then(function (cursor) {
            console.log("done");
            return cursor.all();
        })
    },
    addInterchange: function (header_id, item_id) {
        var edges_collection = db.collection(edges_collection_name);
        var data = {
            _key: 'header_' + header_id + '_' + item_id,
            type: 'interchange',
            test: 1,
            _from: 'interchange_headers/header_' + header_id,
            _to: "parts/" + item_id
        }
        return edges_collection.save(
            data
        );
    },

    removeInterchange: function (header_id, item_id) {
        var edges_collection = db.collection(edges_collection_name);
        var edge_key = 'header_' + header_id + '_' + item_id;
        return edges_collection.remove(edge_key);
    }
}