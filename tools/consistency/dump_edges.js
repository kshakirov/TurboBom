let consistencyLib = require('./consistency_lib'),
    fs = require('fs'),
    collections = ['parts'];

function build_query(collection) {
    return  {
        msg: `Copying ${collection} `,
        query: `For i in ${collection}
            limit 10
            return i
`, filename: `${collections}.json`

    }
}

let queries = collections.map(c => build_query(c));

async function asyncForEach(queries) {
    for (let index = 0; index < queries.length; index++) {
        const result = await consistencyLib.execQuery(queries[index].query);
        result.forEach(r=>{
            fs.appendFileSync(queries[index].filename, JSON.stringify(r) + "\n");
        });

    }
}


asyncForEach(queries);
