let consistencyLib = require('./consistency_lib'),
    fs = require('fs'),
    moment = require ('moment'),
    collections = ['parts', 'bom_edges', 'interchange_headers', 'interchange_edges', 'alt_interchange_headers', 'alt_interchange_edges'];

function build_query(collection) {
    return {
        msg: `Copying ${collection} `,
        query: `For i in ${collection}
            return i
`, filename: `${collection}.json`

    }
}

let queries = collections.map(c => build_query(c)),
    dateString = moment().format("YYYYMMDD"),
    backupDir = `${require('os').homedir()}/backup/${dateString}`;
if(!fs.existsSync(backupDir)){
    fs.mkdir(backupDir)
}

async function asyncForEach(queries) {
    for (let index = 0; index < queries.length; index++) {
        const result = await consistencyLib.execQuery(queries[index].query);

        if (fs.existsSync(`${backupDir}/${queries[index].filename}`)) {
            console.log(`${queries[index].filename} exists, deleting ...`);
            fs.unlinkSync(`${backupDir}/${queries[index].filename}`)
        }
        result.forEach(r => {
            fs.appendFileSync(`${backupDir}/${queries[index].filename}`, JSON.stringify(r) + "\n");
        });

    }
}


asyncForEach(queries);
