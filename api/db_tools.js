let config = require('config');
let dbConfig = config.get('TurboGraph.dbConfig');
let range = require('range');
let partModel = require('../models/part');
let interchangeModel = require('../models/interchanges');
let bomModel = require('../models/bom');
Database = require('arangojs').Database;
let db = new Database({url: dbConfig.url});

db.useDatabase(dbConfig.dbName);
db.useBasicAuth(dbConfig.login, dbConfig.password);

module.exports = {
    truncateTestCollections: function () {
        let collectionNames = [dbConfig.partCollection,
            dbConfig.interchangeHeaderCollection,
        dbConfig.altInterchangeHeaderCollection];

        let edgesCollection = [dbConfig.bomEdgesCollection,
            dbConfig.interchangeEdgesCollection,
            dbConfig.altInterchangeEdgesCollection];

        let vertice_collections = collectionNames.map(function (name) {
            return db.collection(name);
        });

        let edge_collections = edgesCollection.map(function (name) {
            return db.edgeCollection(name);
        });

        let collections = vertice_collections.concat(edge_collections);
        let actions = collections.map(function (collection) {
            return collection.truncate();
        });
        return Promise.all(actions);
    },

    populateTestCollections: function () {
        let parts = range.range(1, 24);
        let headers = [11,12,13,14,15,16,17];
        parts = parts.map(function (part) {
            return {
                id: part,
                _key: part.toString(),
                type: 'test'
            }
        });
        let part_actions = parts.map(function (part) {
            partModel.addPart(part);
        });
        return Promise.all(part_actions).then(function (promise) {

            let actions = headers.map(function (header) {
                return interchangeModel.addInterchangeHeader(header)
            });
            actions = actions.concat(parts.slice(0, 5).map(function (p) {
                return interchangeModel.addInterchange(11, p.id);
            }));

            actions = actions.concat(parts.slice(6, 17).map(function (p) {
                interchangeModel.addInterchange(12, p.id);
            }));

            actions.push(interchangeModel.addInterchange(13, 19));
            actions.push(interchangeModel.addInterchange(14, 18));
            actions.push(interchangeModel.addInterchange(14, 20));
            actions.push(interchangeModel.addInterchange(15, 21));
            actions.push(interchangeModel.addInterchange(16, 22));
            actions.push(interchangeModel.addInterchange(17, 23));
            return Promise.all(actions);
        })

    },

   populateAltTestCollections: function () {
       let parts = range.range(1, 11);
       parts = parts.map(function (part) {
           return {
               id: part,
               _key: part.toString(),
               type: 'testAlternative'
           }
       });
       let part_actions = parts.map(function (part) {
           partModel.addPart(part);
       });
       return Promise.all(part_actions).then(function () {
           let actions = [];
           actions.push(bomModel.addBom(1,2,4));
           actions.push(bomModel.addBom(1,3,2));
           actions.push(bomModel.addBom(5,6,1));
           actions.push(bomModel.addBom(5,7,2));
           return Promise.all(actions);
       })


   }
};
