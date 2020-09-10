let BomModel = require('../../models/bom_v2');
let assert = require('assert');


describe('Bom', function () {
    describe('#addBom', function () {
        it('should create Boms', function (done) {
            BomModel.removeBom('1', '2').then(res => {
                BomModel.addBom('1', '2', '1').then(promise => {
                    assert.equal('test_bom_edges/1_2', promise._id);
                    done();
                });
            });
        });
    });

    describe('#deleteBom', function () {
        it('should delete Boms', function (done) {
            BomModel.addBom('102', '202', '1').then(promise => {
                BomModel.findBom('102', 5).then(found => {
                    assert.equal(1, found.length);
                    assert.equal(202, found[0].partId);
                    BomModel.removeBom('102', '202').then(res => {
                        BomModel.findBom('102', 5).then(notFound => {
                            assert.equal(0, notFound.length);
                            done();
                        });
                    });

                });

            });

        });
    });

    describe('#findBom', function () {
        it('should find Boms', function (done) {
            BomModel.removeBom('100', '200').then(res => {
                BomModel.addBom('100', '200', '1').then(promise => {
                    BomModel.findBom('100',5).then(foundPromise => {
                        assert.equal(1, foundPromise.length);
                        assert.equal(200, foundPromise[0].partId);
                        assert.equal(1, foundPromise[0].qty);
                        done();

                    });
                });
            });
        });
    });

    describe('#updateBom', function () {
        it('should update Boms', function (done) {
            BomModel.removeBom('101', '201').then(res => {
                BomModel.addBom('101', '201', '1').then(promise => {
                    BomModel.updateBom('101', '201', '2').then(updated => {
                        BomModel.findBom('101',5).then(foundPromise => {
                            assert.equal(1, foundPromise.length);
                            assert.equal(201, foundPromise[0].partId);
                            assert.equal(2, foundPromise[0].qty);
                            done();

                        });
                    });
                });
            });
        });
    });

    describe('#findBomAsChild', function () {

        it('should find Boms as child', function (done) {
            BomModel.removeBom('103', '203').then(res => {
                BomModel.addBom('103', '203', '1').then(promise => {
                    BomModel.findBomAsChild('203').then(response => {
                        assert.equal(1, response.length);
                        assert.equal(103, response[0].vertice.partId);
                        done();
                    })

                });
            });
        });
    });

    describe('#findOnlyBom', function () {

        it('should find only Boms', function (done) {
            BomModel.removeBom('104', '204').then(res => {
                BomModel.addBom('104', '204', '1').then(promise => {
                    BomModel.findOnlyBom('104').then(response => {
                        assert.equal(1, response.length);
                        assert.equal(204, response[0].partId);
                        done();
                    })

                });
            });
        });
    });

    after(function () {
        console.log("Test Finished")
    });

});
