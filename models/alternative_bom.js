let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
let alt_interchange_edges_collection_name = dbConfig.altInterchangeEdgesCollection;
let  alt_interchange_headers_collection_name = dbConfig.altInterchangeHeaderCollection;
let  parts_collection_name = dbConfig.partCollection;


function addAltInterchangeHeader(header_id, parent_id, child_id=null) {
    let headers_collection = db.collection(alt_interchange_headers_collection_name);
    let data = {
        type: 'alt_header',
        header: parseInt(header_id),
        parentId: parseInt(parent_id),
        childId: parseInt(child_id),
        description: ""
    };
    if(header_id){
        data._key = header_id.toString()
    }
    return headers_collection.save(data);
}

function addPartrToAltGroup(parent_id, child_id, part_id, header_id) {
    let edges_collection = db.collection(alt_interchange_edges_collection_name);
    let edge = {
        _key: `${[header_id]}_${part_id}`,
        type: 'alt_bom',
        parentId: parseInt(parent_id),
        childId: parseInt(child_id),
        _from: `${alt_interchange_headers_collection_name}/${header_id}`,
        _to: `${parts_collection_name}/${part_id}`

    };
    return edges_collection.save(edge);
}



module.exports = {

    addAltInterchangeHeader: addAltInterchangeHeader,
    addPartrToAltGroup: addPartrToAltGroup,

    findGroupByHeader: function (header_id) {
        let query = `FOR v, e, p IN 1..1 ANY '${alt_interchange_headers_collection_name}/${header_id}' GRAPH 'BomGraph'
          FILTER p.edges[0].type == "alt_bom" 
          RETURN  v.partId`;
        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },

    addAlternativeBom: function (parent_id, child_id, part_id, header_id) {
        let actions = [];
        if(!header_id){
       return     addAltInterchangeHeader(header_id, parent_id).then((header)=>{
                actions.push(addPartrToAltGroup(parent_id, child_id, child_id, header._key));
                actions.push(addPartrToAltGroup(parent_id, child_id,part_id, header._key));
                return Promise.all(actions).then(()=>{
                    return header._key;
                });
            })
        }else{
            return addPartrToAltGroup(parent_id,child_id, part_id, header_id).then(()=>{
                return header_id;
            })
        }
    },
    removeAlternativeBom: function (part_id, header_id) {
        let edges_collection = db.collection(alt_interchange_edges_collection_name);
        let edge_key = header_id + '_' + part_id;
        return edges_collection.remove(edge_key);
    },
    findAlternativeBom: function (parent_id, child_id) {
        let query = `FOR v, e, p IN 1..2 ANY '${parts_collection_name}/${child_id}' GRAPH 'BomGraph'
          FILTER p.edges[0].type == "alt_bom" AND  p.edges[0].parentId==${parent_id} AND  p.edges[0].childId==${child_id}
          RETURN {
            partId: v.partId,
            type: v.type,
            header: v.header,
            altHeader: v._key
          }`;
        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },
    removeAltHeader: function (alt_header_id) {
        const graph = db.graph(dbConfig.graph);
        const headers_collection = graph.vertexCollection(alt_interchange_headers_collection_name);
        return headers_collection.remove(alt_header_id);
    }

};
