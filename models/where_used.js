Database = require('arangojs').Database;
var flatten = require('array-flatten')
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');


function _find_bom  (id) {
    var query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH 'BomGraph'
  FILTER p.edges[0].type == "direct"
  RETURN  {
        'partId' : p.vertices[1]._key,
        "partNumber" : p.vertices[1].part_number,
        "partTypeName" : p.vertices[1].part_type,
        "manufacturerName" : "not yet name",
        "relationType": p.edges[0].type,
        "distance": 1
  }`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function _find_interchanges (id) {
    var query = `FOR v, e, p IN 2..2 ANY 'parts/${id}' GRAPH 'InterchangeGraph'
  FILTER p.edges[0].type == 'interchange'
  RETURN  {
        'partId' : p.vertices[2]._key,
        "partNumber" : p.vertices[2].part_number,
        "partTypeName" : p.vertices[2].part_type,
        "manufacturerName" : "not yet name",
        "relationType": 'interchange',
        "distance": 1
  }`;

    return db.query(query).then(function (cursor) {
        console.log("done");
        return cursor.all();
    })
}

function find_where_used(id, result) {

    return _find_bom(id).then(function (wus) {
        var ids = wus.map(function (wu) {
            return wu.partId;
        })
        var ints_queries = ids.map(_find_interchanges);
        var results = Promise.all(ints_queries);
        return results.then(function (promise) {
            var result = flatten(promise,2);
                return result.concat(wus);
        })
    })
    
}
module.exports = {
    findWhereUsed: find_where_used
}
