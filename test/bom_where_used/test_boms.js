var BomModel = require('../../models/bom');
var DbTools = require('../../api/db_tools');
var WhereUsedModel = require('../../models/where_used');
var assert = require('assert');


describe('Bom', function () {
    before(function (done) {
        DbTools.truncateTestCollections().then(function () {
            DbTools.populateTestCollections().then(function () {
                done();
            })        // runs before all tests in this block
        })
    });
    describe('#addBom', function () {
        it('should create Boms', function (done) {
            var actions = [];
            actions.push(BomModel.addBom(19, 18));
            actions.push(BomModel.addBom(1, 7));
            actions.push(BomModel.addBom(19, 1));
            actions.push(BomModel.addBom(7, 22));
            Promise.all(actions).then(function (promises) {
                BomModel.findBom(19, 4).then(function (boms) {
                    assert.equal(4, boms.length)
                    done()
                })
            })

        });
    });


    describe('#findWhereUsed', function () {
        it('should create Boms', function (done) {
            WhereUsedModel.findWhereUsed(22, 40).then(function (promise) {
                assert.equal(21, promise.length)
                done()
            })
        });
    });


    describe('#addBom', function () {
        it('should create Boms', function (done) {
            BomModel.removeBom(19, 1).then(function (promises) {
                BomModel.findBom(19, 4).then(function (boms) {
                    assert.equal(1, boms.length)
                    done()
                })
            })

        });
    });


    after(function () {
        console.log("Test Finished")
    });

});
