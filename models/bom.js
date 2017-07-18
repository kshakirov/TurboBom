function findAll (callback) {
    // Query DB for a page of customers
    // Mocked out here as out of scope
    setImmediate(function () {
        callback(null, [
            {id: 1, name: 'Jane Doe'},
            {id: 2, name: 'John Doe'}
        ])
    })
}

exports.findAll = findAll