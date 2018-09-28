let WhereUsedCassandra = require('../models/where_used'),
    wu_ctrl = require('../controllers/where_used_cassandra');


function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}




//85565 staging is not correct interchanges
//1004 production is not correct
//47778

WhereUsedCassandra.findWhereUsedCassandraSimple(47778).then(r => {

    let items = r.filter(i => i.type !== 'header');
    console.log(`Count: ${items.length}`);
    write_to_file("simple_raw.json", items);
    let ds = wu_ctrl.group_directs_simple(items);
    console.log(`Count Directs: ${Object.keys(ds).length}`);
    write_to_file("direct_simple.json", ds);
    let is = wu_ctrl.group_interchanges_simple(items);
    console.log(`Count Interchanges: ${Object.keys(is).length}`);
    write_to_file("interchange_simple.json", is);
    let all = wu_ctrl.group_all_simple(ds, is);
    console.log(`Count Interchanges: ${Object.keys(all).length}`);
    write_to_file("all_simple.json", all);
    let response = wu_ctrl.prep_response_simple(all);
    write_to_file("response_simple.json", response);

});
