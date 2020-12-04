var config = require('config');
var dbConfig = config.get('TurboGraph_v2.dbConfig');
var Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

let getGasketKitByPartNumberQuery = `FOR part IN parts
  FILTER part.attributes.part_type == 'Gasket Kit' && part.attributes.part_number == '_partNumber'
  return part`;

let getGasketKitPartNumberByTurboIdQuery = `FOR part IN parts
  FILTER to_number(part._key) == _partId
  return part.turboAttributes.gasketKit`;


let getGasketKitPartNumberByIdQuery = `FOR part IN parts
  FILTER to_number(part._key) == _partId
  return part.partNumber`;

let getTurbosByGasketKitPartNumberQuery = `FOR part IN parts
  FILTER part.turboAttributes.gasketKit == '_partNumber'
  return part`;


let getGasketKitByPartNumber = async (partNumber) => (await db.query(getGasketKitByPartNumberQuery.replace('_partNumber', partNumber))).all();

let getGasketKitPartNumberByTurboId = async (partId) => (await db.query(getGasketKitPartNumberByTurboIdQuery.replace('_partId', partId))).all();

let getGasketKitPartNumberById = async (partId) => (await db.query(getGasketKitPartNumberByIdQuery.replace('_partId', partId))).all();

let getTurbosByGasketKitPartNumber = async (partNumber) => (await db.query(getTurbosByGasketKitPartNumberQuery.replace('_partNumber', partNumber))).all();

exports.getGasketKitByPartNumber = getGasketKitByPartNumber;
exports.getGasketKitPartNumberByTurboId = getGasketKitPartNumberByTurboId;
exports.getGasketKitPartNumberById = getGasketKitPartNumberById;
exports.getTurbosByGasketKitPartNumber = getTurbosByGasketKitPartNumber;