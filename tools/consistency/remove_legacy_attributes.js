let consistencyLib =require('./consistency_lib');

let rem_attr_query =`FOR p IN parts
     UPDATE p WITH {
        attributes: null,
        sku: null,
        manufacturerId: null
    } IN parts OPTIONS { keepNull: false }`;

consistencyLib.execQuery(rem_attr_query);
