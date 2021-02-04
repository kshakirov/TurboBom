const queries = require('./queries/interchanges');
const utils = require('../utils/arangoutils');
const config = require('config');
const dbConfig = config.get('TurboGraph_v2.dbConfig');

const SAVE = 'save', REMOVE = 'remove';
const EDGES = dbConfig.interchangeEdgesCollection;
const HEADERS = dbConfig.interchangeHeaderCollection;

module.exports = {
    find: (id) => utils.select(queries.byId, id),
    findPage: (id, offset, limit) => utils.select(queries.byIdPage, id, offset, limit),
    findByHeaderId: (headerId) => utils.select(queries.byHeaderId, headerId),
    findHeaderByItemId: (id) => utils.select(queries.headerByItemId, id),
    remove: (id) => utils.execute(dbConfig.interchangeEdgesCollection, REMOVE, id),
    createHeader: () => utils.execute(HEADERS, SAVE, { type: 'header' }),
    add: (requestBody) => utils.execute(EDGES, SAVE, requestBody)
}