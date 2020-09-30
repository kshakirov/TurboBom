let config = require('config');
let dbConfig = config.get('TurboGraph_v2.dbConfig');
let Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const findBomQuery = `for  p,e,v 
        in 1.._depth outbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter (p.type != 'header' && p.type != 'Created') 
        && !(e.type=='direct' && v.edges[-2].type =='interchange') 
        &&  count(remove_value(v.edges[*].type,'interchange')) < _distance  
        && !(v.vertices[0].partId== _id && v.edges[0].type =='interchange' )
        
       return distinct {
        partId: TO_NUMBER(p._key),
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        qty: e.quantity,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

const findBomEcommerceQuery = `for  p,e,v 
        in 1..6  outbound 'parts/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter !(e.type=='direct' && v.edges[-2].type =='interchange') && 
         count(remove_value(v.edges[*].type,'interchange')) < _distance  && !(v.vertices[0].partId== _id && v.edges[0].type =='interchange' )
        
       return distinct {
        sku: TO_NUMBER(p._key),
        partId: p._key,
        description: p.attributes.description,
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        quantity: e.quantity,
        part_type: p.attributes.part_type,
        part_number: p.attributes.part_number,
        name: p.attributes.name,
        manufacturer: p.attributes.manufacturer,
        prices: p.attributes.prices,
        type: p.type,
        part_type_parent: null,
        parentId: null, 
        prices: [],
        distance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

const findBomPageQuery = `for  p,e,v 
        in 1.._depth outbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter (p.type != 'header' && p.type != 'Created') 
        && !(e.type=='direct' && v.edges[-2].type =='interchange') 
        &&  count(remove_value(v.edges[*].type,'interchange')) < _distance  
        && !(v.vertices[0].partId== _id && v.edges[0].type =='interchange' )
        LIMIT _offset, _limit
       return distinct {
        partId: TO_NUMBER(p._key),
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        qty: e.quantity,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

const findOnlyBomQuery = `for  p,e,v 
        in 1.._depth outbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}
        filter   count(v.edges[*]) < _distance  
       return distinct {
        partId: TO_NUMBER(p._key),
        bomPartId: v.vertices[-2].partId,
        qty: e.quantity,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange'))
        }`;

const findOnlyTiDirectBomQuery = `for  p,e,v 
        in 1.._depth outbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}
        filter   count(v.edges[*]) < _distance && p.attributes.manufacturer == 'Turbo International'
       return distinct {
        sku: TO_NUMBER(p._key),
        qty: e.quantity,
        part_number: p.attributes.part_number,
        part_type: p.attributes.part_type,
        description: p.description
        }`;

const findBomAsChildQuery = `FOR v, e, p IN 1..1 INBOUND '${dbConfig.partCollection}/_id' GRAPH '${dbConfig.graph}'
            FILTER p.edges[0].type == "direct"
            RETURN {
                vertice: v,
                edge: e
            }`;

const findBomCassandraQuery = `for  p,e,v 
        in 1..6  outbound '${dbConfig.partCollection}/_id' ${dbConfig.bomEdgesCollection}, any ${dbConfig.interchangeEdgesCollection}
        filter !(e.type=='direct' && v.edges[-2].type =='interchange') &&  count(remove_value(v.edges[*].type,'interchange')) < _distance  && !(v.vertices[0].partId== _id && v.edges[0].type =='interchange' )
        
       return distinct {
        sku: p._key,
         partId: p._key,
        description: p.attributes.description,
        prices: p.group_prices,
        bomPartId: v.vertices[-3].partId,
        nodeType: e.type,
        quantity: e.quantity,
        part_type: p.attributes.part_type,
        part_number: p.attributes.part_number,
        manufacturer: p.attributes.manufacturer,
        type: p.type,
        relationDistance:  count(remove_value(v.edges[*].type,'interchange')),
        relationType: count(remove_value(v.edges[*].type,'direct')) == 0 
}`;

let checkCyclic = async (parent_id, child_id) => {
    let query = `FOR v, e IN OUTBOUND SHORTEST_PATH '${dbConfig.partCollection}/${child_id}' TO '${dbConfig.partCollection}/${parent_id}' 
    GRAPH '${dbConfig.graph}' 
    RETURN [v.type]`;
    return (await (await db.query(query)).all()).length;
};

let docsExists = async (parent_id, child_id) => {
    let parts = db.collection(dbConfig.partCollection);
    let promises = [];
    promises.push(parts.document(parent_id));
    promises.push(parts.document(child_id));
    return Promise.all(promises);
}

let findBom = async (id, distance, depth = 5) =>
    (await db.query(findBomQuery.replace('_id', id).replace('_id', id).replace('_distance', distance + 1).replace('_depth', depth))).all();


let findBomEcommerce = async (id, distance) =>
    (await db.query(findBomEcommerceQuery.replace('_id', id).replace('_id', id).replace('_distance', distance + 1))).all();

let findBomPage = async (offset, limit, id, distance, depth = 5) =>
    (await db.query(findBomPageQuery.replace('_offset', offset).replace('_limit', limit).replace('_id', id).replace('_id', id).replace('_distance', distance + 1).replace('_depth', depth))).all();

let findOnlyBom = async (id, distance = 10, depth = 5) => (await db.query(findOnlyBomQuery.replace('_id', id).replace('_distance', distance).replace('_depth', depth))).all();

let findOnlyTiDirectBom = async (id, distance = 10, depth = 5) => (await db.query(findOnlyTiDirectBomQuery.replace('_id', id).replace('_distance', distance).replace('_depth', depth))).all();

let findBomAsChild = async (id) => (await db.query(findBomAsChildQuery.replace('_id', id))).all();

let removeBom = async (parentId, childId) => await db.collection(dbConfig.bomEdgesCollection).remove(parentId + '_' + childId);

let updateBom = async (parentId, childId, qty) => db.collection(dbConfig.bomEdgesCollection).update(parentId + '_' + childId, {quantity: qty});

let addBom = async (parentId, childId, quantity = 0) => {
    const isCyclic = (await checkCyclic(parentId, childId));
    if(isCyclic) {
        return {message: "Cyclic path"};
    }
    if((await docsExists(parentId, childId))) {
        return db.collection(dbConfig.bomEdgesCollection).save(
            {
                _key: parentId + '_' + childId,
                type: 'direct',
                quantity: quantity,
                _from: dbConfig.partCollection + '/' + parentId,
                _to: dbConfig.partCollection + '/' + childId
            }
        );
    }
    return {message: "Nodes don't exist"};
}

let findBomCassandra = async (id, distance) => (await db.query(findBomCassandraQuery.replace('_id', id).replace('_id', id).replace('_distance', distance + 1))).all();

exports.findBom = findBom;
exports.findOnlyTiDirectBom = findOnlyTiDirectBom;
exports.findBomEcommerce = findBomEcommerce;
exports.findBomPage = findBomPage;
exports.findOnlyBom = findOnlyBom;
exports.findBomAsChild = findBomAsChild;
exports.removeBom = removeBom;
exports.updateBom = updateBom;
exports.addBom = addBom;
exports.findBomCassandra = findBomCassandra;