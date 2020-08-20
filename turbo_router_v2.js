let  express = require('express');
let  router = express.Router();

let  interchange = require('./controllers/interchange_v2');

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next()
});

router.get('/interchanges/:header_id', function (req, res) {
    interchange.findInterchangesByHeaderId(req, res);
});

router.get('/parts/:id/interchanges', function (req, res) {
    interchange.findInterchange(req, res);
});

module.exports = router;
