Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');

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
    }
}
