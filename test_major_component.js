let MajorComponentController = require('./controllers/major_component');


function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}


MajorComponentController.findMajorComponentBase(25370).then(r=>{
    console.log(r);
    write_to_file('major_comps_25370.json', r)
});

MajorComponentController.findMajorComponentBase(68157).then(r=>{
    console.log(r);
    write_to_file('major_comps_68157.json', r)
});
