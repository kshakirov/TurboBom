let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');

Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});

db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

let collectionNames = [dbConfig.partCollection,
    dbConfig.interchangeHeaderCollection];

collectionNames.map(function (name) {
    let collection = db.collection(name);
    collection.truncate();
});

let edgesCollection = [dbConfig.bomEdgesCollection,
    dbConfig.interchangeEdgesCollection];

edgesCollection.map(function (name) {
    let collection = db.edgeCollection(name);
    collection.truncate()
});

let altCollectionNames = [dbConfig.altInterchangeEdgesCollection,
    dbConfig.altInterchangeHeaderCollection];

altCollectionNames.map(function (name) {
    let collection = db.collection(name);
    collection.truncate();
});
