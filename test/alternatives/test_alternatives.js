let AlternativeBomModel = require('../../models/alternative_bom');
let DbTools = require('../../api/db_tools');
let assert = require('assert');


describe('Bom', function () {
    before(function (done) {
        DbTools.truncateTestCollections().then(function () {
            DbTools.populateAltTestCollections().then(function () {
                done();
            })        // runs before all tests in this block
        })
    });
    describe('#addAltInterchangeHeader', function () {
        it('should create Alt Header', function (done) {
            AlternativeBomModel.addAltInterchangeHeader(111, 5).then((header) => {
                let actions = [];
                actions.push(AlternativeBomModel.addPartrToAltGroup(5, 7, 7, 111));
                actions.push(AlternativeBomModel.addAlternativeBom(5, 7, 8, 111));
                actions.push(AlternativeBomModel.addAlternativeBom(5, 7, 9, 111));

                Promise.all(actions).then((p) => {
                    assert(true);
                    done();
                }, (error) => {
                    console.log(error);
                    done();
                })

            })
        });
    });

    describe('#addAltBom', function () {
        it('should create alt edges', function (done) {
            AlternativeBomModel.addAlternativeBom(1, 2, 4, null).then((promise) => {
                assert(parseInt(promise) > 100);
                done();
            })
        });
    });

    describe('#findAltBom', function () {
        it('should find alt boms', function (done) {
            AlternativeBomModel.findAlternativeBom(1, 2).then((promise) => {
                assert.equal(2, promise.length);
                done();
            })
        });
    });

    describe('#removeAltBom', function () {
        it('should remove alt bom', function (done) {
            AlternativeBomModel.removeAlternativeBom(8, 111).then((promise) => {
                AlternativeBomModel.findAlternativeBom(5, 7).then((promise) => {
                    assert.equal(2, promise.length);
                    done();
                })
            })
        });
    });

});
