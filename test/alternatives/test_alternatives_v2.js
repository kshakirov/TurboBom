let alternativeBomModel = require('../../models/alternative_bom_v2');
let assert = require('assert');


describe('Bom', function () {
    describe('#addBom', function () {
        it('should add alternative Boms', function (done) {
            alternativeBomModel.addAlternativeBom('100', '200', '300').then(res => {
                let header = res;
                alternativeBomModel.findAlternativeBom('100', '200').then(boms => {
                    let createdHeader = boms.filter(it => it.altHeader == header);
                    assert.equal(1, createdHeader.length);
                    let createdBom = boms.filter(it => it.partId == 300);
                    assert.equal(true, createdBom.length > 0);
                    done();
                });

            });
        });
    });

    describe('#removeBom', function () {
        it('should remove alternative Boms', function (done) {
            alternativeBomModel.addAlternativeBom('101', '201', '301').then(res => {
                let header = res;
                alternativeBomModel.findAlternativeBom('101', '201').then(boms => {
                    assert.equal(1, boms.filter(it => it.partId == 301).length);
                    alternativeBomModel.removeAlternativeBom('301', header).then(removed => {
                        alternativeBomModel.findAlternativeBom('101', '201').then(newBoms => {
                            assert.equal(0, newBoms.filter(it => it.partId == 301).length);
                            done();
                        });
                    });


                });

            });
        });
    });

    // describe('#removeBom', function () {
    //     it('should remove alternative Boms', function (done) {
    //         alternativeBomModel.addAltInterchangeHeader('101', '201', '301').then(res => {
    //             let header = res;
    //             alternativeBomModel.findAlternativeBom('101', '201').then(boms => {
    //                 assert.equal(1, boms.filter(it => it.partId == 301).length);
    //                 alternativeBomModel.removeAlternativeBom('301', header).then(removed => {
    //                     alternativeBomModel.findAlternativeBom('101', '201').then(newBoms => {
    //                         assert.equal(0, newBoms.filter(it => it.partId == 301).length);
    //                         done();
    //                     });
    //                 });
    //
    //
    //             });
    //
    //         });
    //     });
    // });


    after(function () {
        console.log("Test Finished")
    });

});
