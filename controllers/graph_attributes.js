let graph_model = require('../models/graph_attributes');


function get_children(req, res) {
    let collection_name = 'attachment_nodes',
        graph_name = req.params.graphId,
        starting_node_key = req.params.nodeId;

    return graph_model.getChildren(graph_name, collection_name, starting_node_key).then(
        children => {
            res.set('Connection', 'close');
            res.json(children.map(ch => ch.name));
        }, error => {
            res.json(error.message);
        }
    )
}


exports.getChildren = get_children;
