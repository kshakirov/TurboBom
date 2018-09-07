let WhereUsedCassandra = require('./controllers/where_used_cassandra');

function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}


WhereUsedCassandra.findWhereUsedCassandra(43847).then(r => {
    console.log(r);
    write_to_file("resp_final.json", r)
});
