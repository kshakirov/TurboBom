let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const collection = db.collection("reference"),
    from_collection = "A_part",
    to_collection = from_collection,
    parent_key = `${from_collection}_parent`;




function add_edge (batch_size, batch_offset) {
    return Array(batch_size).fill().map((x,i)=>{
        return {
            _from: `${from_collection}/${parent_key}`,
            _to: `${to_collection}/${i + batch_offset}`,
            path: `${parent_key}_${i + batch_offset}`,
            aux: true
        }
    })
}


async function asyncForEach(batch_size, batch_qty) {
    for(let i = 0; i < batch_qty; i++) {
        let n_parts = await collection.import(add_edge(batch_size, i * batch_size));
        console.log(`Imported ${i}` )
    }
}



asyncForEach(10000,100);
