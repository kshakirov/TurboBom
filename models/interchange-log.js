const axios = require('axios');
let config = require('config');
let host = config.get('InterchangeLogService.host');
let port = config.get('InterchangeLogService.port');

function log(partId, oldHeader, newHeader, action) {
    let data = {
        'partId': partId,
        'oldHeader': oldHeader,
        'newHeader': newHeader,
        'action': action
    };
    return axios.post('http://' + host + ':' + port + '/log', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
}

function logGroup(partIds, oldHeader, newHeader, action) {
    let data = {
        'partIds': partIds,
        'oldHeader': oldHeader,
        'newHeader': newHeader,
        'action': action
    };
    return axios.post('http://' + host + ':' + port + '/log-group', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
        console.error(err);
    });
}

exports.log = log;
exports.logGroup = logGroup;