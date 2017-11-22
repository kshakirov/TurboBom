var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');

Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});

db.useBasicAuth(dbConfig.login, dbConfig.password);

db.dropDatabase(dbConfig.dbName).then(r => {
    console.log(`Database [${dbConfig.dbName}] Deleted`)
},e =>{
    console.log(e.stack);
})
