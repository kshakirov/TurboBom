let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
let parts_collection_name = dbConfig.partCollection;


function failed_to_update(res) {
    let failed = res.find(r => r.hasOwnProperty('error'));
    return failed !== undefined;
}


module.exports = {
    addPart: function (product) {
        let parts_collection = db.collection(parts_collection_name);

        return parts_collection.save(
            product
        );
    },

    removePart: function (id) {
        let parts_collection = db.collection(parts_collection_name);
        return parts_collection.remove(id.toString());
    },

    updatePart: function (id, product) {
        let parts_collection = db.collection(parts_collection_name);
        return parts_collection.update(id.toString(), product);
    },

    getPart: function (id) {
        let parts_collection = db.collection(parts_collection_name);
        return parts_collection.document(id);
    },
    addBulk: function (products) {
        let parts_collection = db.collection(parts_collection_name);
        return parts_collection.bulkUpdate(products).then(res => {
            if (failed_to_update(res)) {
                return parts_collection.import(products).then(rr =>{
                    //console.log(rr)
                });
            }
            return true;
        }, error => {
            console.log(error.msg);
            return false
        })
    }


};
