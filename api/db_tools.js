var config = require('config');
var dbConfig = config.get('TurboGraph.dbConfig');
var range = require('range');
var partModel = require('../models/part');
var interchangeModel = require('../models/interchanges');
Database = require('arangojs').Database;
var db = new Database({url: dbConfig.url});

db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

module.exports = {
    truncateTestCollections: function () {
        var collectionNames = [dbConfig.partCollection,
            dbConfig.interchangeHeaderCollection];

        var edgesCollection = [dbConfig.bomEdgesCollection,
            dbConfig.interchangeEdgesCollection];

        var vertice_collections = collectionNames.map(function (name) {
            return db.collection(name);
        })

        var edge_collections = edgesCollection.map(function (name) {
            return db.edgeCollection(name);
        })

        var collections = vertice_collections.concat(edge_collections);
        var actions = collections.map(function (collection) {
            return collection.truncate();
        })
        return Promise.all(actions);
    },

    populateTestCollections: function () {
        var parts = range.range(1, 24);
        var headers = [11,12,13,14,15,16,17];
        parts = parts.map(function (part) {
            return {
                id: part,
                _key: part.toString(),
                type: 'test'
            }
        })
        var part_actions = parts.map(function (part) {
            partModel.addPart(part);
        })
        return Promise.all(part_actions).then(function (promise) {

            var actions = headers.map(function (header) {
                return interchangeModel.addInterchangeHeader(header)
            })
            actions = actions.concat(parts.slice(0, 5).map(function (p) {
                return interchangeModel.addInterchange(11, p.id);
            }))

            actions = actions.concat(parts.slice(6, 17).map(function (p) {
                interchangeModel.addInterchange(12, p.id);
            }))

            actions.push(interchangeModel.addInterchange(13, 19));
            actions.push(interchangeModel.addInterchange(14, 18));
            actions.push(interchangeModel.addInterchange(14, 20));
            actions.push(interchangeModel.addInterchange(15, 21));
            actions.push(interchangeModel.addInterchange(16, 22));
            actions.push(interchangeModel.addInterchange(17, 23));
            return Promise.all(actions);
        })

    }
}
