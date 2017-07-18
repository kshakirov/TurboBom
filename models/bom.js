Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');

module.exports = {
    findBom: function (id) {
        var query = `FOR v, e, p IN 1..1 OUTBOUND 'parts/${id}' GRAPH 'BomGraph'
  FILTER p.edges[0].type == "direct"
  RETURN p.vertices[1]`;

        return db.query(query).then(function (cursor) {
            console.log("done");
            return cursor.all();
        })
    }
}
// exports.findBom = findBom
//
// var Database = require('arangojs');
// var db = new Database({url:'http://127.0.0.1:8529'});
// module.exports = {
//     getAllUsers : function()
//     {
//         return db.database('nodeArangoWebAppDB')
//             .then(function (mydb) {return mydb.query('FOR x IN User RETURN x');})
//             .then(function (cursor) { return  cursor.all();});
//     }
// }