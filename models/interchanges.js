let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
const uuidv1 = require('uuid/v1');

let edges_collection_name = dbConfig.interchangeEdgesCollection;
let interchange_headers_collection_name = dbConfig.interchangeHeaderCollection;


function removeInterchange(header_id, item_id) {
    let edges_collection = db.collection(edges_collection_name);
    let edge_key = header_id.toString() + '_' + item_id.toString();
    return edges_collection.remove(edge_key);
}


function addInterchange(header_id, item_id) {
    let edges_collection = db.collection(edges_collection_name);
    let data = {
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
    let headers_collection = db.collection(interchange_headers_collection_name);
    let data = {
        _key: header_id.toString(),
        type: 'header',
        header: header_id
    }
    return headers_collection.save(data);
}



function createInterchangeHeader() {
    let headers_collection = db.collection(interchange_headers_collection_name);
    let data = {
        type: 'header'
    };
    return headers_collection.save(data).then(function (promise) {
        return promise._key;
    }, function (error) {

    });
}

function dto_header_key(promise) {
    return promise[0].key;
}


function findInterchangeHeaderByItemId(id) {
    let query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "interchange"
          RETURN  {
                key: p.vertices[1]._key,
                  partId: p._key,
                  partType: p.partType,
                  manufacturer: p.manufacturer,
                  partNumber: p.partNumber
          }`;

    return db.query(query).then(function (cursor) {
        return cursor.all();
    })
}


function addInterchangeToGroup(in_item_id, out_item_id) {
    let find_actions = [
        findInterchangeHeaderByItemId(in_item_id),
        findInterchangeHeaderByItemId(out_item_id)];
    return Promise.all(find_actions).then(function (promise) {
        removeInterchange(dto_header_key(promise[1]), out_item_id).then(function (promiseInternal) {
            let cd_actions = [
                promiseInternal,
                addInterchange(dto_header_key(promise[0]), out_item_id)
            ]
            return Promise.all(cd_actions);
        });
    })
}


module.exports = {
    findInterchange: function (id) {
        let query = `FOR v, e, p IN 2..2 ANY 'parts/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        RETURN v`;

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
        let find_actions = [
            findInterchangeHeaderByItemId(in_item_id),
            findInterchangeHeaderByItemId(out_item_id)];

        return Promise.all(find_actions).then(function (promise) {
            removeInterchange(dto_header_key(promise[1]), out_item_id).then(function (promiseInternal) {
                let cd_actions = [
                    promiseInternal,
                    addInterchange(dto_header_key(promise[0]), out_item_id)
                ]
                return Promise.all(cd_actions);
            });
        })
    },
    leaveInterchangeGroup: function (id) {
        return findInterchangeHeaderByItemId(id).then(function (promise) {
            let old_header_id = dto_header_key(promise);
            return removeInterchange(old_header_id, id).then(function () {
                return createInterchangeHeader().then(function (header_id) {
                    let hh = header_id;
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
            let tuples = interchanges.map(function (interchange) {
                console.log(interchange.partId);
                return addInterchangeToGroup(id, interchange.partId)
            });
            tuples.push(addInterchangeToGroup(id, picked_id));
            return Promise.all(tuples)
        })
    },

    findInterchangesByHeaderId: function (header_id) {
        let query = `FOR v, e, p IN 1..1 OUTBOUND 'interchange_headers/${header_id}' GRAPH '${dbConfig.graph}'
          //FILTER p.edges[0].type == "interchange"
          RETURN  v`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    }

}
