const config = require('config');
const dbConfig = config.get('TurboGraph_v2.dbConfig');

const returnStructure = `RETURN {
            sku: v.sku,
            partNumber: v.partNumber,
            manufacturer: v.manufacturer,
            partType: v.partType,
            description: v.description,
            name: v.name,
            prices: v.group_prices,
            inactive: v.inactive
        }`;

module.exports = {

    byId: (id) => `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        ${returnStructure}`,

    byIdPage : (id, offset, limit) => `FOR v, e, p IN 2..2 ANY '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        LIMIT ${offset}, ${limit}
        ${returnStructure}`,

    byHeaderId: (headerId) => `FOR v, e, p IN 1..1 OUTBOUND '${dbConfig.interchangeHeaderCollection}/${headerId}' GRAPH '${dbConfig.graph}'  ${returnStructure}`,

    headerByItemId: (id) => `FOR v, e, p IN 1..1 INBOUND '${dbConfig.partCollection}/${id}' GRAPH '${dbConfig.graph}'
          FILTER p.edges[0].type == "interchange"
          RETURN  { key: p.vertices[1]._key }`
}