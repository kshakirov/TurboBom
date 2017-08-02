Database = require('arangojs').Database;
var db = new Database({url: 'http://127.0.0.1:8529'});
db.useDatabase("Bom");
db.useBasicAuth('root', 'servantes');
var parts_collection_name = 'parts';

module.exports = {
    addPart: function (product) {
        var parts_collection = db.collection(parts_collection_name);
        var data = {
            _key: product.id.toString(),
            part_number: product.part_number,
            name: product.name,
            part_type: product.part_type,
            description: product.description
        }
        return parts_collection.save(
            data
        );
    },

    removePart: function (id) {
        var parts_collection = db.collection(parts_collection_name);
        return parts_collection.remove(id.toString());
    },

    updatePart: function (product) {
        var parts_collection = db.collection(parts_collection_name);
        return parts_collection.update( product.id.toString(), product );
    },


}