const axios = require('axios');
let config = require('config');
let host = config.get('InterchangeLogService.host');
let port = config.get('InterchangeLogService.port');

function create(partId, oldHeader, newHeader) {
    let data = {
        'partId': partId,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    return axios.post('http://' + host + ':' + port + '/log/interchange/create', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
}

function leave(partId, oldHeader, newHeader) {
    let data = {
        'partId': partId,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    return axios.post('http://' + host + ':' + port + '/log/interchange/leave', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
}

function add(partId, toPartId, oldHeader, newHeader) {
    let data = {
        'partId': partId,
        'toPartId': toPartId,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    return axios.post('http://' + host + ':' + port + '/log/interchange/add', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
}

function merge(partIds, oldHeader, newHeader) {
    let data = {
        'partIds': partIds,
        'oldHeader': oldHeader,
        'newHeader': newHeader
    };
    return axios.post('http://' + host + ':' + port + '/log/interchange/merge', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
}

exports.create = create;
exports.leave = leave;
exports.add = add;
exports.merge = merge;