Database = require('arangojs').Database;
var db = new Database({url:'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
db.collections().
then(
    result=> {
    console.log(result.length);
},
    err => console.error(err.stack)
)

var parts_collection = db.collection('parts');
parts_collection.document("29953").then(
    doc => {
        console.log(doc);
    },
    err => console.error(err.stack)
)

graph = db.graph('BomGraph');
graph.get().then(
    grap => {
        console.log(grap)
    },
    err => console.error(err.stack)

);

var id = 42045;
var query = `FOR v, e, p IN 1..1 OUTBOUND 'parts/${id}' GRAPH 'BomGraph'
  FILTER p.edges[0].type == "direct"
  RETURN p.vertices[1]` ;

db.query(query).then(function (cursor) {
    var vertices = [];
    cursor.each(function (part) {
        vertices.push(part)
    });
    return vertices;
}, function (error) {
    console.log("dfdf");
})

