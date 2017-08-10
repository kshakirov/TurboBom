var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');

Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});

db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

var collectionNames = [dbConfig.partCollection, dbConfig.interchangeHeaderCollection];

collectionNames.map(function (name) {
    var collection = db.collection(name);
    collection.truncate();
})

var edgesCollection = [dbConfig.interchangeEdgesCollection,
    dbConfig.interchangeEdgesCollection];

edgesCollection.map(function (name) {
    var collection = db.edgeCollection(name);
    collection.truncate()
})
