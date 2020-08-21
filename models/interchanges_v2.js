let config = require('config');
let dbConfig = config.get('TurboGraph_v2.dbConfig');
let Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

let executeQuery = async (query) => (await db.query(query)).all();

let returnStructure = `RETURN {
            sku: v.sku,
            partNumber: v.partNumber,
            manufacturer: v.manufacturer,
            partType: v.partType,
            description: v.description,
            name: v.name
        }`;

let findInterchangeQuery = `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/_id' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        ${returnStructure}`;

let findInterchangesPageQuery = `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/_id' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        LIMIT _offset, _limit
        ${returnStructure}`;

let findInterchangesByHeaderIdQuery = `FOR v, e, p IN 1..1 OUTBOUND '${dbConfig.interchangeHeaderCollection}/_header_id' GRAPH '${dbConfig.graph}'  ${returnStructure}`;

let findInterchangeHeaderByItemIdQuery = `FOR v, e, p IN 1..1 INBOUND '${dbConfig.partCollection}/_id' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "interchange"
          RETURN  { key: p.vertices[1]._key }`;

let findInterchange = (id) => executeQuery(findInterchangeQuery.replace('_id', id));


let findInterchangesPage = (id, offset, limit) => executeQuery(findInterchangesPageQuery.replace('_id', id).replace('_offset', (offset < 0 || limit < 0) ? 0 : offset).replace('_limit', (offset < 0 || limit < 0) ? 0 : limit));

let findInterchangesByHeaderId = (header_id) => executeQuery(findInterchangesByHeaderIdQuery.replace('_header_id', header_id));

let findInterchangeHeaderByItemId = (id) => executeQuery(findInterchangeHeaderByItemIdQuery.replace('_id', id));

exports.findInterchange = findInterchange;
exports.findInterchangesByHeaderId = findInterchangesByHeaderId;
exports.findInterchangeHeaderByItemId = findInterchangeHeaderByItemId;
exports.findInterchangesPage = findInterchangesPage;