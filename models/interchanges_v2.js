let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
const uuidv1 = require('uuid/v1');

module.exports = {
    findInterchange: function (id) {
        let query = `FOR v, e, p IN 2..2 ANY 'parts/${id}' GRAPH '${dbConfig.graph}'
        FILTER p.edges[0].type == 'interchange'
        RETURN v`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },
    findInterchangesByHeaderId: function (header_id) {
        let query = `FOR v, e, p IN 1..1 OUTBOUND 'interchange_headers/${header_id}' GRAPH '${dbConfig.graph}'
          //FILTER p.edges[0].type == "interchange"
          RETURN  v`;

        return db.query(query).then(function (cursor) {
            return cursor.all();
        })
    },
    findInterchangeHeaderByItemId: function (id) {
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
}