let serviceController = require('./controllers/service_kits'),
    kits = [{
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
        }];

serviceController.findServiceKitsBase(kits).then(sc => {
    console.log(sc);
});

