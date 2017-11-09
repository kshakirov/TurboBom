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
/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

// For gzip compression
//app.use(express.compress());
app.use(compression())
app.use(require('connect-livereload')({
    port: 35730
}));
/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/dist/views');

    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');

    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');
//app.use(require('./controllers'))

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

// app.get('/', function(request, response, next) {
//     response.render('index');
// });
//
// app.get('/bom', function(request, response, next) {
//     var resp = {test: 1};
//     response.json(resp);
// });
/*
 * Start it up
 */

let custom_port = process.argv[2] || 9009;
app.listen(process.env.PORT || custom_port);

console.log('Express started on port ' + custom_port);
