Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
var edges_collection_name = 'interchange_edges';
var interchange_headers_collection_name = 'interchange_headers';

function removeInterchange (header_id, item_id) {
    var edges_collection = db.collection(edges_collection_name);
    var edge_key = 'header_' + header_id + '_' + item_id;
    return edges_collection.remove(edge_key);
}


function addInterchange(header_id, item_id) {
    var edges_collection = db.collection(edges_collection_name);
    var data = {
        _key: 'header_' + header_id + '_' + item_id,
        type: 'interchange',
        _from: 'interchange_headers/header_' + header_id,
        _to: "parts/" + item_id
    }
    return edges_collection.save(
        data
    );
}

function dto_header_key(promise, order) {
    return promise[order][0].key.replace('header_','')
}


module.exports = {
    findInterchange: function (id) {
        var query = `FOR v, e, p IN 2..2 ANY 'parts/${id}' GRAPH 'BomGraph'
        FILTER p.edges[0].type == 'interchange'
        RETURN  {
                "id" : p.vertices[2]._key,
                "manufacturerPartNumber" : p.vertices[2].part_number,
                "partType" : { "name" : p.vertices[2].part_type},
                "manufacturer" : {"name" : "not yet name"}
        }`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },

    findInterchangeHeaderByItemId: function (id) {
        var query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH 'BomGraph'
          FILTER p.edges[0].type == "interchange"
          RETURN  {
                key: p.vertices[1]._key
          }`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },


    addInterchange: addInterchange,
    removeInterchange: removeInterchange,
    addInterchangeHeader: function (header_id) {
        var headers_collection = db.collection(interchange_headers_collection_name);
        var data = {
            _key: 'header_' + header_id,
            type: 'test',
            header: header_id
        }
        return headers_collection.save(data);
    },
    addInterchangeToGroup: function (in_item_id, out_item_id) {
        var find_actions = [
            this.findInterchangeHeaderByItemId(in_item_id),
            this.findInterchangeHeaderByItemId(out_item_id)];
        return Promise.all(find_actions).then(function (promise) {
            var cd_actions = [
                removeInterchange(dto_header_key(promise,1), out_item_id),
                addInterchange(dto_header_key(promise,0), out_item_id)
            ]
            return Promise.all(cd_actions);
        })
    },

}
