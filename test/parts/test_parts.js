var PartsModel = require('../../models/part');
var product = {
    id: 1000000,
    part_number: 'A-1000-D',
    name: 'Test Name',
    part_type: 'Turbo',
    description: 'Test Description'
}
PartsModel.addPart(product).then(function (product) {
    console.log(product)
})

PartsModel.removePart(1000000).then(function (product) {
    console.log(product)
})

product.name = 'Updated Name'

PartsModel.updatePart(product).then(function (product) {
    console.log(product)
})
