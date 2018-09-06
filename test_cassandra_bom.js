let BomModel = require('./models/bom');
let BomController = require('./controllers/bom');
let DbTools = require('./api/db_tools');



BomController.findBomCassandraTest(6587,1,40).then(r=>{
    console.log(r)
});
