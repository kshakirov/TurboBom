let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

async function exec_query(query) {
    const cursor = await db.query(query);
    const results = await cursor.all();
    console.log("Done Query Executed");
    return results;

}

module.exports ={
    execQuery: exec_query
};




