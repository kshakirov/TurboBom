let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

const collection = db.collection("reference"),
    from_collection = "A_part",
    parent_key = `${from_collection}_parent`;






//asyncForEach(10,1);
async  function traverse () {
    const res = db.query(`FOR v, e, p IN 1..4 OUTBOUND 'A_part/A_part_parent' GRAPH 'TestGraph'
        FILTER  p.vertices[1]._key=='393014'
    //1_25_3  [uuid, 123, 125.12]
        limit 5,5
        RETURN   {
        'a': p.vertices[1]._key,
        'b': p.vertices[2]._key
        }`,{}, {count: true, options: {fullCount: true}});
    await res;
    console.log(res.then(r =>console.log(r)))
}

traverse();
