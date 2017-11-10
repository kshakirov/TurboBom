'use strict';

/*
 * Express Dependencies
 */
var compression = require('compression')
var express = require('express');
var app = express();
var port = 9009;
var bodyParser = require('body-parser');
var posix = require('posix');
posix.setrlimit('nofile', { soft: 50000});


// For gzip compression
//app.use(express.compress());
app.use(compression())
app.use(require('connect-livereload')({
    port: 35730
}));
/*
 * Config for Production and Development
 */



/*
 * Routes
 */
// Index Page

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var routers = require('./turbo_router')


app.use('/', routers)



let custom_port = process.argv[2] || 9009;
app.listen(process.env.PORT || custom_port);

console.log('Express started on port ' + custom_port);
