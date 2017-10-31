let PartController = require('../../controllers/part'),
    InterchangesModel = require('../../models/interchanges'),
    DbTools = require('../../api/db_tools'),
    assert = require('assert');


describe('Part', function () {
    before(function (done) {
        DbTools.truncateTestCollections().then(function () {
            DbTools.populateTestCollections().then(function () {
                done();
            })        // runs before all tests in this block
        })
    });
    describe('#addPart()', function () {
        it('should add part, create interchange group and add itself to it', function (done) {
            let req = {
                    body: {
                        manufacturerId: 1,
                        partTypeId: 1
                    },
                    params: {
                        id: 1000000
                    }
                },
                res = {
                    mocke: null,
                    json: function (arg) {
                        this.mock = arg;
                    }
                }
            PartController.addPart(req, res).then((promise) => {
                InterchangesModel.findInterchangeHeaderByItemId(req.params.id).then((r) => {
                    assert.equal(1, r);
                    done()
                });
            })

        });
    });
})
