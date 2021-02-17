const leaveGroupService = require('../../../services/interchange/interchange_v2_leave_group');
const assert = require('assert');

let newHeaderId = -1;
let oldHeaderId = 0;
let returnDescription = 'testDescription';
let transactionId = -2;

const removedKeys = [];
const added = [];
const logs = [];

const interchangeModel = {
    findHeaderByItemId: (id) => [{'key': oldHeaderId}],
    remove: (key) => removedKeys.push(key),
    createHeader: () => ({'_key': newHeaderId}),
    add: (interchange) => added.push(interchange)
};

const interchangeLog = {
    leave: (itemId, oldHeaderId, newHeaderId) => {
        logs.push({'itemId': itemId, 'oldHeaderId': oldHeaderId, 'newHeaderId': newHeaderId});
        return {'description': returnDescription, 'transactionId': transactionId};
    }
};

leaveGroupService.wireDependencies(interchangeModel, interchangeLog);


describe('Interchange', function () {
    describe('#find()', function () {
        it('', function (done) {
            const itemId = 1;
            leaveGroupService.leaveGroup(itemId).then(response => {
                assert.equal(1, removedKeys.length);
                assert.equal(oldHeaderId + '_' + itemId, removedKeys[0]);

                assert.equal(1, added.length);
                assert.equal(
                    JSON.stringify({
                    _key: newHeaderId + '_' + itemId,
                    type: 'interchange',
                    _from: 'interchange_headers/' + newHeaderId,
                    _to: 'parts/' + itemId
                }),
                    JSON.stringify(added[0]));

                assert.equal(1, logs.length);
                assert.equal(
                    JSON.stringify({ itemId: 1, oldHeaderId: 0, newHeaderId: -1 }),
                    JSON.stringify(logs[0]));

                console.log(response);

                assert.equal(
                    JSON.stringify({ success: true,
                        oldHeaderId: oldHeaderId,
                        newHeaderId: newHeaderId,
                        description: returnDescription,
                        transactionId: transactionId }),
                    JSON.stringify(response));

                done();
            });

        });
    });
});
