var InterchangesModel = require('../../models/interchange/interchanges_v2');
var DbTools = require('../../api/db_tools');

var assert = require('assert');


describe('Interchange', function () {
    describe('#find()', function () {
        it('', function (done) {
            InterchangesModel.find(1324).then(function (promise) {
                assert.equal(2, promise.length);
                assert.equal('1338', promise[0].sku);
                assert.equal('1326', promise[1].sku);
                done()
            })

        });
    });

    describe('#findHeaderByItemId()', function () {
        it('', function (done) {
            InterchangesModel.findHeaderByItemId(1324).then(function (promise) {
                assert.equal(1, promise.length);
                assert.equal('208034970528', promise[0].key);
                done()
            })

        });
    });

    describe('#findByHeaderId()', function () {
        it('', function (done) {
            InterchangesModel.findByHeaderId(208034970528).then(function (promise) {
                assert.equal(3, promise.length);
                assert.equal('1338', promise[0].sku);
                assert.equal('1324', promise[1].sku);
                assert.equal('1326', promise[2].sku);
                done()
            })

        });
    });

    describe('#findPage()', function () {
        it('', function (done) {
            InterchangesModel.findPage(1324, 0, 1).then(function (promise) {
                assert.equal(1, promise.length);
                assert.equal('1338', promise[0].sku);
                done()
            })

        });
    });

    describe('#findInterchangesPageNegative()', function () {
        it('', function (done) {
            InterchangesModel.findPage(1324, -1, 1).then(function (promise) {
                assert.equal(0, promise.length);
                done()
            })

        });
    });
});
