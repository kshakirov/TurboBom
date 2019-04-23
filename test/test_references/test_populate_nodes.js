let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const collection = db.collection("D_part");
//const collection = db.collection("C_part");
//const collection = db.collection("B_part");
//const collection = db.collection("A_part");

 function add_vertice (batch_size, batch_offset) {
     return Array(batch_size).fill().map((x,i)=>{
         return {_key: (batch_offset + i) .toString(), number: `${batch_offset + i}`}
     })
}




async function asyncForEach(batch_size, batches_qty) {
     for(let i = 0; i < batches_qty; i++) {
         let n_parts = await collection.import(add_vertice(batch_size, i * 10000));
        console.log(`Imported ${i}` )
    }
}



asyncForEach(10, 1);
//asyncForEach(10000, 1);
//asyncForEach(10000, 10);
//asyncForEach(10000, 100);
