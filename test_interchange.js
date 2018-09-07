let  InterchangesModel = require('./models/interchanges'),
    InterchangeController = require('./controllers/interchange');

// InterchangesModel.findInterchange(43744).then(promise => {
//    console.log(promise)
// });

InterchangeController.testFindInterchange(43744).then(r =>{
    console.log(r)
});
