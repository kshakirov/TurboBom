Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');

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
    }
}