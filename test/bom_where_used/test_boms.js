let BomModel = require('../../models/bom');
let DbTools = require('../../api/db_tools');
let WhereUsedModel = require('../../models/where_used');
let assert = require('assert');


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
            let actions = [];
            actions.push(BomModel.addBom(19, 18));
            actions.push(BomModel.addBom(1, 7));
            actions.push(BomModel.addBom(19, 1));
            actions.push(BomModel.addBom(7, 22));
            Promise.all(actions).then(function () {
                BomModel.findBom(19, 4).then(function (boms) {
                    assert.equal(24, boms.length);
                    done()
                })
            })

        });
    });


    describe('#findWhereUsed', function () {
        it('should create Boms', function (done) {
            WhereUsedModel.findWhereUsed(22, 40).then(function (promise) {
                assert.equal(20, promise.length);
                done()
            })
        });
    });


    describe('#addBom', function () {
        it('should create Boms', function (done) {
            BomModel.removeBom(19, 1).then(function () {
                BomModel.findBom(19, 4).then(function (boms) {
                    assert.equal(4, boms.length);
                    done()
                })
            })

        });
    });

    describe('#checkCyclic', function () {
        it('should check whether adding a part makes sub graph cyclic', function (done) {
            BomModel.addBom(7,1).then(function () {
                assert(false);
                done()
            }, function (error) {
                assert.equal("Cyclic path", error.message);
                done()
            })

        });
    });



    after(function () {
        console.log("Test Finished")
    });

});
