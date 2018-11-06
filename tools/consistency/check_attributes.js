let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);


let parts_collection = db.collection(dbConfig.partCollection);

const p_normalize = p=> {
    console.log(`${p.partId} => ${p._key}`);
    return {
        _key: p._key,
        partId: p.partId,
        partTypeId: p.partTypeId,
        manufacturerId: p.manufacturerId,
        sku: null,
        attributes: null

    }
};

const p_rem_duplicates = p => {
    console.log(` Removing ${p._key}`);
    return p._key;
};

const normalize_condition = "x.sku != null",
    rem_dup_condition='TO_STRING(x.partId) != x._key';


async function normalize_parts(count, offset) {
    const cursor = await db.query(`FOR x IN   ${dbConfig.partCollection}  FILTER ${normalize_condition}   Sort x.partId LIMIT ${offset}, ${count}   RETURN x`);
    const results = await cursor.map(p_normalize);
    if(results && results.length > 0){
        const u_results = await parts_collection.bulkUpdate(results,{keepNull: false,mergeObjects: false,returnNew: true}).catch(e => {
            console.log(e)
        });
        offset = offset + count;
        count_cursor(count, offset)
    }else{
        return true;
    }


}


async function remove_duplicates(count, offset) {
    const cursor = await db.query(`FOR x IN   ${dbConfig.partCollection}  FILTER ${rem_dup_condition}   Sort x.partId LIMIT ${offset}, ${count}   RETURN x`);
    const results = await cursor.map(p_rem_duplicates);
    if(results && results.length > 0){
        results.forEach(key => parts_collection.remove(key));
        offset = offset + count;
        //remove_duplicates(count, offset)
    }else{
        return true;
    }


}




const done_np = normalize_parts(5, 0);
const done_rd = remove_duplicates(200, 0);
