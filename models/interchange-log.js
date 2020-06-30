const axios = require('axios');
let config = require('config');
let host = config.get('InterchangeLogService.host');
let port = config.get('InterchangeLogService.port');

function log(partId, oldHeader, newHeader) {
    let data = {
        'partId': partId,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    axios.post('http://' + host + ':' + port + '/log', data)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Body: ', res.data);
        }).catch((err) => {
        console.error(err);
    });
}

function logGroup(partIds, oldHeader, newHeader) {
    let data = {
        'partIds': partIds,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    axios.post('http://' + host + ':' + port + '/log-group', data)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Body: ', res.data);
        }).catch((err) => {
        console.error(err);
    });
}

exports.log = log;
exports.logGroup = logGroup;