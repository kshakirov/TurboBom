var WhereUsedModel = require('../models/where_used.js');

var assert = require('assert');
describe('WhereUsedModel', function() {
    describe('#findWhereUsed()', function () {
        it('should return  8 when the value is not present', function (done) {
            WhereUsedModel.findWhereUsed(42131).then(function (promise) {
                assert.equal(157, promise.length);
                done()
            })

        });
    });
})
