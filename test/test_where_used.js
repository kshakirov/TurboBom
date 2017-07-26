var WhereUsedModel = require('../models/where_used.js');
WhereUsedModel.findWhereUsed(42131).then(function (wu) {
    console.log(wu)
})
