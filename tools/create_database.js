var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});

function create_collections() {
    db.useDatabase(dbConfig.dbName);
    db.useBasicAuth(dbConfig.login, dbConfig.password);

    let collectionNames = [
        dbConfig.partCollection,
        dbConfig.interchangeHeaderCollection,
        dbConfig.altInterchangeHeaderCollection
    ];
    let operations = [];

    collectionNames.map(function (name) {
        let collection = db.collection(name);
        operations.push(collection.create())
    });

    let
        edgesCollection = [
            dbConfig.bomEdgesCollection,
            dbConfig.interchangeEdgesCollection,
            dbConfig.altInterchangeEdgesCollection
        ];

    edgesCollection.map(function (name) {
        let collection = db.edgeCollection(name);
        operations.push(collection.create())
    });

    return Promise.all(operations).then(success => {
        return true;
    }, e => {
        console.log(e.stack);
        return false;
    })
}

function create_graph() {
    const graph = db.graph(dbConfig.graph);
    return graph.create({
        edgeDefinitions: [
            {
                collection: dbConfig.bomEdgesCollection,
                from: [dbConfig.partCollection],
                to: [dbConfig.partCollection]
            },
            {
                collection: dbConfig.interchangeEdgesCollection,
                from: [dbConfig.interchangeHeaderCollection],
                to: [dbConfig.partCollection]
            },
            {
                collection: dbConfig.altInterchangeEdgesCollection,
                from: [dbConfig.altInterchangeHeaderCollection],
                to: [dbConfig.partCollection]
            }
        ]
    }).then(success => {
    }, e => {
        console.log(e.stack)
    });
}


db.useBasicAuth(dbConfig.login, dbConfig.password);

console.log(`Creating Database [${dbConfig.dbName}], credentials Loing [${dbConfig.login}], Password [${dbConfig.password}]`);

db.createDatabase(dbConfig.dbName, [
    {
        username: dbConfig.login,
        passwd: dbConfig.password,
        active: true,
        extra: {}
    }
]).then(p => {
    console.log("Database created");
    create_collections().then(success => {
        console.log("All Collections are successfully created");
        create_graph().then(success => {
            console.log("Graph  created");
        }, e => {
            console.log(e.stack)
        })
    }, e => {
        console.log("Error");
    });

}, err => console.error(err.stack));

