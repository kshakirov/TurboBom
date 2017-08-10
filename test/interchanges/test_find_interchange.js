var InterchangesModel = require('../../models/interchanges');

var assert = require('assert');
describe('Interchange', function() {
    describe('#findInterchange()', function() {
        it('should return  8 when the value is not present', function() {
            InterchangesModel.findInterchange(8).then(function (promise) {
                assert.equal(10, promise.length);
            })

        });
    });
    describe('#findInterchangeHeader()', function() {
        it('should return  8 when the value is not present', function() {
            InterchangesModel.findInterchangeHeaderByItemId(8).then(function (promise) {
                assert.equal('header_12', promise[0].key);
            })

        });
    });
});
