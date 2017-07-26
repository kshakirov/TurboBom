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
        return cursor.all();
    })
}


function _get_intrs_ids(intrs) {
    return intrs.map(function (intr) {
        return intr.partId;
    })
}

function find_where_used(bids, result) {
    var bom_queries = bids.map(_find_bom);
    var prev_result = result;
    var bom_results = Promise.all(bom_queries);
    return bom_results.then(function (bom) {
        var flat_bom = flatten(bom,2);
        var ids = flat_bom.map(function (b) {
            return b.partId;
        })
        var int_queries = ids.map(_find_interchanges);
        var int_results = Promise.all(int_queries);
        return int_results.then(function (ints) {
            var result = flatten(ints,2);
            var n_bids = _get_intrs_ids(result);
            prev_result = prev_result.concat(result).concat(flat_bom);
            if(n_bids  && n_bids.length > 0){
                 return   find_where_used(n_bids, prev_result)
            }else {
                //console.log(prev_result)
                return prev_result;    
            }
            
        })
    })
    
}
module.exports = {
    findWhereUsed: find_where_used
}
