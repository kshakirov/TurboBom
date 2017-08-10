var InterchangesModel = require('../models/interchanges');
const uuidv1 = require('uuid/v1');

var header_id = uuidv1();
// InterchangesModel.addInterchangeHeader(header_id).then(function (header) {
//     console.log(`Header added`);
//     return InterchangesModel.addInterchange(header_id, 41503).then(function (promise) {
//         console.log("Edge added");
//         return InterchangesModel.checkHeaderExists(41503).then(function (header_info) {
//             console.log("Header Info");
//             console.log(header_info);
//             if (header_info[0] && header_info[0].key){
//                 console.log("true")
//             }else{
//                 console.log("false")
//             }
//
//         })
//     })
// })



// InterchangesModel.findInterchange(41503).then(function (bom) {
//     console.log(bom)
// })


InterchangesModel.checkHeaderExists(41503).then(function (header_info) {
    console.log("Header Info");
    console.log(header_info);
    if (header_info[0] && header_info[0].key){
        console.log("true")
    }else{
        console.log("false")
    }

})


