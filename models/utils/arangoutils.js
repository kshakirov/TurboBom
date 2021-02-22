const config = require('config');
const dbConfig = config.get('TurboGraph_v2.dbConfig');
const Database = require('arangojs').Database;
const db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);


module.exports = {
    select: async (queryFn, ...queryParams) => {
        // try {
            const query = queryFn.apply(null, queryParams);
            return (await db.query(query)).all();
            //return {'data': (await db.query(query)).all()};
        // } catch(e) {
        //     console.log(Date.now() + ' Error: ' + e + ' queryFn: ' + queryFn + ' queryParams: ' + queryParams);
        //     return {'error': e};
        // }
    },

    execute: async (collectionName, fnName, arg) => {
        // try {
            const collection = await db.collection(collectionName);
            return (await collection[fnName](arg));
           // return {'data': (await collection[fnName](arg))};
        // } catch(e) {
        //     console.log(Date.now() + ' Error: ' + e + ' collectionName: ' + collectionName + ' fnName: ' + fnName + ' arg: ' + arg);
        //     return {'error': e};
        // }
    }
}
