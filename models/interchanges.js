var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
const uuidv1 = require('uuid/v1');

var edges_collection_name = dbConfig.interchangeEdgesCollection;
var interchange_headers_collection_name = dbConfig.interchangeHeaderCollection;


function removeInterchange(header_id, item_id) {
    var edges_collection = db.collection(edges_collection_name);
    var edge_key = header_id.toString() + '_' + item_id.toString();
    return edges_collection.remove(edge_key);
}


function addInterchange(header_id, item_id) {
    var edges_collection = db.collection(edges_collection_name);
    var data = {
        _key: header_id.toString() + '_' + item_id.toString(),
        type: 'interchange',
        _from: 'interchange_headers/' + header_id,
        _to: "parts/" + item_id
    }
    return edges_collection.save(
        data
    );
}


function addInterchangeHeader(header_id) {
    var headers_collection = db.collection(interchange_headers_collection_name);
    var data = {
        _key: header_id.toString(),
        type: 'Populated',
        header: header_id
    }
    return headers_collection.save(data);
}



function createInterchangeHeader() {
    var headers_collection = db.collection(interchange_headers_collection_name);
    var data = {
        type: 'Created'
    }
    return headers_collection.save(data).then(function (promise) {
        return promise._key;
    }, function (error) {

    });
}

function dto_header_key(promise) {
    return promise[0].key;
}


function findInterchangeHeaderByItemId(id) {
    var query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH 'BomGraph'
          FILTER p.edges[0].type == "interchange"
          RETURN  {
                key: p.vertices[1]._key
          }`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function addInterchangeToGroup(in_item_id, out_item_id) {
    var find_actions = [
        findInterchangeHeaderByItemId(in_item_id),
        findInterchangeHeaderByItemId(out_item_id)];
    return Promise.all(find_actions).then(function (promise) {
        var cd_actions = [
            removeInterchange(dto_header_key(promise[1]), out_item_id),
            addInterchange(dto_header_key(promise[0]), out_item_id)
        ]
        return Promise.all(cd_actions);
    })
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

    findInterchangeHeaderByItemId: findInterchangeHeaderByItemId,
    addInterchange: addInterchange,
    removeInterchange: removeInterchange,
    addInterchangeHeader: addInterchangeHeader,
    createInterchangeHeader: createInterchangeHeader,



    addInterchangeToGroup: function (in_item_id, out_item_id) {
        var find_actions = [
            findInterchangeHeaderByItemId(in_item_id),
            findInterchangeHeaderByItemId(out_item_id)];
        return Promise.all(find_actions).then(function (promise) {
            var cd_actions = [
                removeInterchange(dto_header_key(promise[1]), out_item_id),
                addInterchange(dto_header_key(promise[0]), out_item_id)
            ]
            return Promise.all(cd_actions);
        })
    },
    leaveInterchangeGroup: function (id) {
        return findInterchangeHeaderByItemId(id).then(function (promise) {
            var old_header_id = dto_header_key(promise);
            return removeInterchange(old_header_id, id).then(function () {
                return createInterchangeHeader().then(function (header_id) {
                    var hh = header_id;
                    return addInterchange(header_id, id).then(function (promise) {
                        return header_id;
                    });
                })
            })
        }, function (error) {
            console.log(error);
            return false;
        })
    },

    mergeItemGroupToAnotherItemGroup: function (id, picked_id) {
        return this.findInterchange(picked_id).then(function (interchanges) {
            var tuples = interchanges.map(function (interchange) {
                console.log(interchange.id);
                addInterchangeToGroup(id, interchange.id)
            })
            tuples.push(addInterchangeToGroup(id, picked_id));
            return Promise.all(tuples)
        })
    },

    findInterchangesByHeaderId: function (header_id) {
        var query = `FOR v, e, p IN 1..1 OUTBOUND 'interchange_headers/${header_id}' GRAPH 'BomGraph'
          //FILTER p.edges[0].type == "interchange"
          RETURN  {
                key: p.vertices[1]._key
          }`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    }

}
