const config = require('config');
const dbConfig = config.get('TurboGraph_v2.dbConfig');

const Database = require('arangojs').Database;
const db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const redisService = require('./services/redis.service');

const redisKeys = require('./controllers/redis-keys');

const interchangeService = require('./models/interchange/interchanges_v2');
const altBomService = require('./models/alternative_bom_v2');
const bomService = require('./models/bom_v2');
const whereUsedService = require('./models/where_used_v2');
const kitMatrixService = require('./services/kit-matrix/find');
const serviceKitsService = require('./services/service-kits/find');

let INTERCHANGE_HEADER_IDS = 'FOR v IN interchange_headers FILTER v.header != null return DISTINCT v.header';


let PART_IDS = 'FOR v IN parts FILTER v.partId != null return distinct v.partId';


let cachingParams = [
    [ INTERCHANGE_HEADER_IDS, interchangeService.findByHeaderId, redisKeys.interchangeHeaderId ],
    [ PART_IDS, interchangeService.find, redisKeys.interchangeId ],
    [ PART_IDS, bomService.findBom, redisKeys.bomId],
    [ PART_IDS, whereUsedService.findWhereUsed, redisKeys.whereUsedId],
    [ PART_IDS, kitMatrixService.getKitMatrix, redisKeys.kitMatrixId],
    [ PART_IDS, serviceKitsService.findServiceKits, redisKeys.serviceKitsId]
];


let selectQuery = async (query) => {
    let result = await (await db.query(query)).all();
    return result;
};


let executeCaching = async (params) => {
    console.log(Date.now() + ' - Started execution of ' + params[1].name);
    const idsQuery = params[0];
    const selectQueryFn = params[1];
    const redisKeyFn = params[2];
    const ids = (await selectQuery(idsQuery)).map(it => it.toString());
    for(let i = 0; i < ids.length; i++) {
        try {
            let currentId = ids[i];
            let value = await selectQueryFn.apply(null, [currentId]);
            redisService.setItem(redisKeyFn.apply(null, [currentId]), JSON.stringify(value));
        } catch(e) {
            console.error(Date.now() + ' - Method ' + params[1].name + ' for id ' + ids[i] + ' ' + e);
        }

    }
    console.log(Date.now() + ' - Finished execution of ' + params[1].name);
}

cachingParams.forEach(it => executeCaching(it));