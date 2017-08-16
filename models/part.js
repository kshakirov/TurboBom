var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
var parts_collection_name = dbConfig.partCollection;

module.exports = {
    addPart: function (product) {
        var parts_collection = db.collection(parts_collection_name);

        return parts_collection.save(
            product
        );
    },

    removePart: function (id) {
        var parts_collection = db.collection(parts_collection_name);
        console.log(id)
        return parts_collection.remove(id.toString());
    },

    updatePart: function (id, product) {
        var parts_collection = db.collection(parts_collection_name);
        return parts_collection.update( id.toString(), product );
    },

    getPart: function (id) {
        var parts_collection = db.collection(parts_collection_name);
        return parts_collection.document(id);
    }


}
