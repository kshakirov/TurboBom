var DbTools = require('../api/db_tools');
DbTools.truncateTestCollections().then(function (promise) {
    DbTools.populateTestCollections();
})
