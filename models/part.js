let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
let parts_collection_name = dbConfig.partCollection;

module.exports = {
    addPart: function (product) {
        let parts_collection = db.collection(parts_collection_name);
        console.log(new Date() + 'models/part.addPart, created product: ' + product);
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
        return parts_collection.update( id.toString(), product );
    },

    getPart: function (id) {
        let parts_collection = db.collection(parts_collection_name);
        return parts_collection.document(id);
    }


};
