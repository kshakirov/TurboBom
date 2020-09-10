let config = require('config');
let dbConfig = config.get('TurboGraph_v2.dbConfig');
let Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

let findAlternativeBomQuery = `FOR v, e, p IN 1..2 ANY '${dbConfig.partCollection}/_childId' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "alt_bom" AND  p.edges[0].parentId==_parentId AND  p.edges[0].childId==_childId
          RETURN {
            partId: v.partId,
            type: v.type,
            header: v.header,
            altHeader: v._key
          }`;
let findGroubByHeaderQuery = `FOR v, e, p IN 1..1 ANY '${dbConfig.altInterchangeHeaderCollection}/_headerId' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "alt_bom" parent_part_id
          RETURN  v.partId`;

let findAlternativeBom = async (parentId, childId) =>
    (await db.query(findAlternativeBomQuery.replace('_childId', childId).replace('_childId', childId).replace('_parentId', parentId))).all();

let removeAlternativeBom = async (partId, headerId) => await db.collection(dbConfig.altInterchangeEdgesCollection).remove(headerId + '_' + partId);

let findGroupByHeader = async (headerId) => (await db.query(findGroubByHeaderQuery.replace('_headerId', headerId))).all();

let addAltInterchangeHeader = async (headerId, parentId, childId=null) => {
    let data = {
        type: 'alt_header',
        header: parseInt(headerId),
        parentId: parseInt(parentId),
        childId: parseInt(childId),
        description: ""
    };
    if(headerId){
        data._key = headerId.toString()
    }
    return await db.collection(dbConfig.altInterchangeHeaderCollection).save(data);
}

let addPartToAltGroup = async (parentId, childId, partId, headerId) =>
    await db.collection(dbConfig.altInterchangeEdgesCollection).save({
        _key: `${[headerId]}_${partId}`,
        type: 'alt_bom',
        parentId: parseInt(parentId),
        childId: parseInt(childId),
        _from: `${dbConfig.altInterchangeHeaderCollection}/${headerId}`,
        _to: `${dbConfig.partCollection}/${partId}`
    });

let addAlternativeBom = async (parentId, childId, partId, headerId) => {
    if(!headerId){
        let header = await addAltInterchangeHeader(headerId, parentId);
        await addPartToAltGroup(parentId, childId, childId, header._key);
        await addPartToAltGroup(parentId, childId,partId, header._key);
        return header._key;
    }else{
        await addPartToAltGroup(parentId,childId, partId, headerId);
        return headerId
    }
}

let removeAltHeader = async (alt_header_id) => await db.graph(dbConfig.graph).vertexCollection(dbConfig.altInterchangeHeaderCollection).remove(alt_header_id);


exports.findAlternativeBom = findAlternativeBom;
exports.removeAlternativeBom = removeAlternativeBom;
exports.findGroupByHeader= findGroupByHeader;
exports.addAlternativeBom = addAlternativeBom;
exports.addAltInterchangeHeader = addAltInterchangeHeader;
exports.addPartrToAltGroup = addPartToAltGroup;
exports.removeAltHeader = removeAltHeader;