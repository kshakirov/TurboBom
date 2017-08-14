var InterchangesModel = require('../../models/interchanges');
var DbTools = require('../../api/db_tools');

var assert = require('assert');


describe('Interchange', function () {
    before(function (done) {
        DbTools.truncateTestCollections().then(function () {
            DbTools.populateTestCollections().then(function () {
                done();
            })        // runs before all tests in this block
        })
    });
    describe('#findInterchange()', function () {
        it('should return  8 when the value is not present', function (done) {
            InterchangesModel.findInterchange(8).then(function (promise) {
                assert.equal(10, promise.length);
                done()
            })

        });
    });
    describe('#findInterchangeHeader()', function () {
        it('should return   [header_12]  the key of  header', function (done) {
            InterchangesModel.findInterchangeHeaderByItemId(8).then(function (promise) {
                assert.equal('header_12', promise[0].key);
                done()
            })

        });
    });


    describe('#findInterchangesByHeaderId()', function () {
        it('should return   5 results', function (done) {
            InterchangesModel.findInterchangesByHeaderId(11).then(function (promise) {
                assert.equal( 5, promise.length);
                done()
            })

        });
    });


    describe('#addInterchangeToGroup()', function() {
        it('should return  true', function(done) {
            InterchangesModel.addInterchangeToGroup(7,2).then(function (promise) {
                InterchangesModel.findInterchangeHeaderByItemId(2).then(function (header) {
                    assert.equal('header_12', header[0].key);
                    done()
                })
            })
        });
    });

    describe('#leaveInterchangeToGroup()', function() {
        it('should return  true', function(done) {
            InterchangesModel.leaveInterchangeGroup(3).then(function (promise) {
                InterchangesModel.findInterchangeHeaderByItemId(3).then(function (header) {
                    console.log(header[0].key)
                    assert.notEqual('header_11', header[0].key);
                   done();
                })
            })
        });
    });

    describe('#mergeItemGroupToAnotherItemGroup()', function() {
        it('should return  true', function(done) {
            InterchangesModel.mergeItemGroupToAnotherItemGroup(19,4).then(function (promise) {
                InterchangesModel.findInterchange(19).then(function (interchanges) {
                    console.log(interchanges.length)
                    assert.equal(3, interchanges.length);
                    done();
                })
            })
        });
    });

    after(function () {
        console.log("Test Finished")
    });

});
