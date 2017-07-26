var WhereUsedModel = require('../models/where_used.js');
var res = WhereUsedModel.findWhereUsed([42131])
res.then(function (pr) {
    console.log(pr)
})
