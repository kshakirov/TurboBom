let graph_model = require('../../models/graph_attributes');


graph_model.getChildren("attachment_graph","attachment_nodes","FILE").then(r => console.log(r));
