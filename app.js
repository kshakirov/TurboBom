'use strict';

const compression = require('compression')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const posix = require('posix');
posix.setrlimit('nofile', { soft: 50000});

app.use(compression())
app.use(require('connect-livereload')({
    port: 35730
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const routers = require('./controllers/turbo_router')
const routers2 = require('./controllers/turbo_router_v2')

app.use('/', routers)
app.use('/v2', routers2)


const custom_port = process.argv[2] || 9009;
app.listen(process.env.PORT || custom_port);

console.log('Express started on port ' + custom_port);
