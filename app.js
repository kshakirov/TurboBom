'use strict';

/*
 * Express Dependencies
 */

let cluster = require('cluster');
if (cluster.isMaster) {  
    let cpus = require('os').cpus().length;
    for (let i = 0; i < cpus; i += 1) {
        cluster.fork();
    }    
} else {

let compression = require('compression');
let express = require('express');
let app = express();
let port = 9009;
let bodyParser = require('body-parser');
let posix = require('posix');
posix.setrlimit('nofile', { soft: 50000});


// For gzip compression
//app.use(express.compress());
app.use(compression());
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

let routers = require('./turbo_router');


app.use('/', routers);



let custom_port = process.argv[2] || 9009;
app.listen(process.env.PORT || custom_port);

console.log('Express started on port ' + custom_port);
}
