let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const collection = db.collection("reference"),
    from_collection = "A_part",
    to_collection = "B_part";


function randomIntFromInterval(max) // min and max included
{
    return Math.floor(Math.random() * max) + 1;
}


function add_edge (batch_size, batch_offset, to_keys) {
    return Array(batch_size).fill().map((x,i)=>{
        let to_key = randomIntFromInterval(to_keys);
        return {
            _key: `${from_collection}_${batch_offset + i}_${to_collection}_${to_key}`,
            _from: `${from_collection}/${batch_offset + i}`,
            _to: `${to_collection}/${to_key}`,
            path: `${i}_${to_key}`
        }
    })
}




async function asyncForEach(batch_size, batch_qty, to_keys) {
    for(let i = 0; i < batch_qty; i++) {
        let n_parts = await collection.import(add_edge(batch_size, i * batch_size, to_keys));
        console.log(`Imported ${i}` )
    }
}

//console.log(randomIntFromInterval(100000));

asyncForEach(10000, 100, 100000);

