Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
var parts_collection_name = 'parts';

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


}