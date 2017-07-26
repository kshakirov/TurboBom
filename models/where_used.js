Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');

module.exports = {
    findWhereUsed: function (id) {
        var query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH 'BomGraph'
  FILTER p.edges[0].type != "interchange_graph"
  RETURN  {
  
        'partId' : p.vertices[1]._key,
        "partNumber" : p.vertices[1].part_number,
        "partTypeName" : p.vertices[1].part_type,
        "manufacturerName" : "not yet name",
        "relationType": p.edges[0].type,
        "distance": 1
  }`;

        return db.query(query).then(function (cursor) {
            console.log("done");
            return cursor.all();
        })
    }
}
