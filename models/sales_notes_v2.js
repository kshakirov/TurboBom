let config = require('config');
let dbConfig = config.get('TurboGraph_v2.dbConfig');
let Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);


let getSalesNotesQuery = `FOR part IN parts
  FILTER part.partId == _partId
  return part.salesNotes`;

let getSalesNotes = async (partId) => (await db.query(getSalesNotesQuery.replace('_partId', partId))).all();

exports.getSalesNotes = getSalesNotes;