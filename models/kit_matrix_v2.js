let config = require('config');
let dbConfig = config.get('TurboGraph_v2.dbConfig');
let Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);


let getTurboTypeQuery = `FOR part IN parts
  FILTER part.partId == _partId
  return part.turboAttributes.turboType
  `;

let getKitsByTurboTypeQuery = `FOR part IN parts
  FILTER part.attributes.part_type == 'Kit' and 
         CONTAINS_ARRAY(part.kitAttributes.turboType, '_turboType') and
         part.inactive == false
  return {tiSku: part.partId, ti_part_number: part.attributes.part_number, description: part.description, manufacturer: part.manufacturer}`;

let getTiKitsByTurboTypeQuery = `FOR part IN parts
  FILTER part.attributes.part_type == 'Kit' and 
         part.attributes.manufacturer == 'Turbo International' and
         CONTAINS_ARRAY(part.kitAttributes.turboType, '_turboType')
  return {tiSku: part.partId, ti_part_number: part.attributes.part_number, description: part.description}`;

//example part: 6751

let getTurboType = async (partId) => (await db.query(getTurboTypeQuery.replace('_partId', partId))).all();

let getKitsByTurboType = async (turboType) => (await db.query(getKitsByTurboTypeQuery.replace('_turboType', turboType))).all();

let getTiKitsByTurboType = async (turboType) => (await db.query(getTiKitsByTurboTypeQuery.replace('_turboType', turboType))).all();

exports.getTurboType = getTurboType;
exports.getKitsByTurboType = getKitsByTurboType;
exports.getTiKitsByTurboType = getTiKitsByTurboType;


