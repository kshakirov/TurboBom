let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
let alt_interchange_edges_collection_name = dbConfig.altInterchangeEdgesCollection;
let  alt_interchange_headers_collection_name = dbConfig.altInterchangeHeaderCollection;
let  parts_collection_name = dbConfig.partCollection;

const graph = db.graph(dbConfig.graph);
//graph.addVertexCollection(dbConfig.altInterchangeHeaderCollection).then(()=>{
    const collection = graph.vertexCollection(dbConfig.altInterchangeHeaderCollection);
    collection.count().then((num)=>{
        console.log(num.count)
    })
    collection.vertex('31610671').then((v)=> {
        console.log(v);
        collection.remove('31610671').then(()=>{

        }, (error)=> {
            console.log(error);
        })
    }, (error)=>{
        console.log(error)
    })
//})

