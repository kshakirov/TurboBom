// Maybe this is just some "joi" schema or uses an ORM like bookshelf etc

var bom_model = require('../models/bom')

function getBoms (req, res) {
    bom_model.findAll(function (error, customers) {
        if (error) {
            log.error(error, 'error finding customers')
            res.status(500).send(error)
            return
        }
        res.json(customers)
    })
}

exports.getBoms = getBoms