let kits = [{
        "part_number": "200115-0000",
        "sku": 40272,
        "description": null,
        "manufacturer": "Garrett",
    },
        {
            "part_number": "468139-0000",

            "sku": 40333,
            "description": null,
            "manufacturer": "Garrett",
        },
        {
            "part_number": "707897-0001",
            "sku": 40409,
            "description": null,
            "manufacturer": "Garrett",
        }],
    kitMatrix = require('./controllers/kit_matrix');

function write_to_file(filename, data) {
    let fs = require('fs');
    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

kitMatrix.kitMatrixBase(kits).then(km =>{
    console.log(km);
    write_to_file("kit_matrix.json", km)
});
