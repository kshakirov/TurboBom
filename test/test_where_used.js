var WhereUsedModel = require('../models/where_used.js');
WhereUsedModel.findWhereUsed(2495).then(function (wu) {
    console.log(wu)
})
