let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});
db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);
let parts_collection_name = dbConfig.partCollection;

let findPartsByIdsQuery = 'for part in parts\n' +
    '    filter part._id in [_ids]\n' +
    '    return part';

module.exports = {

    addPart: function (product) {
        let parts_collection = db.collection(parts_collection_name);
        console.log(new Date() + 'models/part.addPart, created product: ' + JSON.stringify(product));
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
    },

    getParts: async function(ids) {
        return (await db.query(findPartsByIdsQuery.replace('_ids', ids.map(it => '"parts/' + it.toString() + '"').join(', ')))).all();
    }


};
