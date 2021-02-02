const config = require('config');
const dbConfig = config.get('TurboGraph_v2.dbConfig');
const Database = require('arangojs').Database;
const db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const SAVE = 'save', REMOVE = 'remove';

const EDGES = db.collection(dbConfig.interchangeEdgesCollection);
const HEADERS = db.collection(dbConfig.interchangeHeaderCollection);

let returnStructure = `RETURN {
            sku: v.sku,
            partNumber: v.partNumber,
            manufacturer: v.manufacturer,
            partType: v.partType,
            description: v.description,
            name: v.name,
            prices: v.group_prices,
            inactive: v.inactive
        }`;

let findInterchangeQuery = (id) => `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        ${returnStructure}`;

let findInterchangesPageQuery = (id, offset, limit) => `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        LIMIT ${offset}, ${limit}
        ${returnStructure}`;

let findInterchangesByHeaderIdQuery = (headerId) => `FOR v, e, p IN 1..1 OUTBOUND '${dbConfig.interchangeHeaderCollection}/${headerId}' GRAPH '${dbConfig.graph}'  ${returnStructure}`;

let findInterchangeHeaderByItemIdQuery = (id) => `FOR v, e, p IN 1..1 INBOUND '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "interchange"
          RETURN  { key: p.vertices[1]._key }`;

let selectQuery = async (query) => {
    try {
        return (await db.query(query)).all();
    } catch(e) {
        console.log(e);
    }
}

let execute = async (collection, fnName, arg) => {
    try {
        await collection;
        return await collection[fnName](arg);
    } catch(e) {
        console.log(e);
    }
}


let findInterchange = (id) => selectQuery(findInterchangeQuery(id));
let findInterchangesPage = (id, offset, limit) => selectQuery(findInterchangesPageQuery(id, (offset < 0 || limit < 0) ? 0 : offset, (offset < 0 || limit < 0) ? 0 : limit));
let findInterchangesByHeaderId = (header_id) => selectQuery(findInterchangesByHeaderIdQuery(header_id));
let findInterchangeHeaderByItemId = (id) => selectQuery(findInterchangeHeaderByItemIdQuery(id));
let removeInterchange = async (id) => execute(EDGES, REMOVE, id);
let createInterchangeHeader = async () => execute(HEADERS, SAVE, { type: 'header' });
let addInterchange = async (headerId, itemId) => execute(EDGES, SAVE, {
    _key: headerId.toString() + '_' + itemId.toString(),
    type: 'interchange',
    _from: 'interchange_headers/' + headerId,
    _to: 'parts/' + itemId
});

exports.findInterchange = findInterchange;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.findInterchangeHeaderByItemId = findInterchangeHeaderByItemId;
exports.findInterchangesPage = findInterchangesPage;
exports.createInterchangeHeader = createInterchangeHeader;
exports.removeInterchange = removeInterchange;
exports.addInterchange = addInterchange;