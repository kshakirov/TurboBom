let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

let edges_collection_name = dbConfig.bomEdgesCollection,
    parts_collection = dbConfig.partCollection;


function check_cyclic(parent_id, child_id) {
    let query = `FOR v, e IN OUTBOUND SHORTEST_PATH '${dbConfig.partCollection}/${child_id}' TO '${dbConfig.partCollection}/${parent_id}' 
    GRAPH '${dbConfig.graph}' 
    RETURN [v.type]`;
    return db.query(query).then(function (cursor) {
        return cursor.all().then(function (promise) {
            return promise.length > 0
        })
    })
}

function docs_exist(parent_id, child_id) {
    let parts = db.collection(parts_collection);
    let promises = [];
    promises.push(parts.document(parent_id));
    promises.push(parts.document(child_id));
    return Promise.all(promises);
}

module.exports = {
    findBom: function (id, distance, depth = 40) {
        let query = `for  p,e,v 
        in 1..${depth} outbound 'parts/${id}' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter !(e.type=='direct' && v.edges[-2].type =='interchange') &&  count(remove_value(v.edges[*].type,'interchange')) < ${distance + 1}  && !(v.vertices[0].partId== ${id} && v.edges[0].type =='interchange' )
        
       return distinct {
        partId: p._key,
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        qty: e.quantity,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },
    findOnlyBom: function (id) {
        let distance = 10,
            depth = 40,
            query = `for  p,e,v 
        in 1..${depth} outbound 'parts/${id}' ${dbConfig.bomEdgesCollection}
        filter   count(v.edges[*]) < ${distance}  
       return distinct {
        partId: p._key,
        bomPartId: v.vertices[-2].partId,
        qty: e.quantity,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange'))
        }`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })

    },

    checkCyclic: check_cyclic,

    addBom: function (parent_id, child_id, quantity = 0) {
        let edges_collection = db.collection(edges_collection_name);
        let data = {
            _key: parent_id + '_' + child_id,
            type: 'direct',
            quantity: quantity,
            _from: 'parts/' + parent_id,
            _to: "parts/" + child_id
        };
        return check_cyclic(parent_id, child_id).then(function (cyclic) {
            if (cyclic) {
                return Promise.reject({message: "Cyclic path"})
            } else {
                return docs_exist(parent_id, child_id).then(s =>{
                    return edges_collection.save(
                        data
                    );
                }, e => {
                    return Promise.reject({message: "Nodes don't exist"})
                });

            }
        })
    },

    removeBom: function (parent_id, child_id) {
        let edges_collection = db.collection(edges_collection_name);
        let edge_key = parent_id + '_' + child_id;
        return edges_collection.remove(edge_key);
    },


    updateBom: function (parent_id, child_id, qty) {
        let edges_collection = db.collection(edges_collection_name);
        let edge_key = parent_id + '_' + child_id;
        return edges_collection.update(edge_key, {quantity: qty})
    },

    findBomAsChild: function (id) {
        let query = `FOR v, e, p IN 1..1 INBOUND 'parts/${id}' GRAPH '${dbConfig.graph}'
            FILTER p.edges[0].type == "direct"
            RETURN {
                vertice: v,
                edge: e
            }`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    }

};
