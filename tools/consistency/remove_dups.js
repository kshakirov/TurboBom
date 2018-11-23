let consistencyLib =require('./consistency_lib');


let rem_dup_query = `
        FOR p IN parts
            filter TO_STRING(p.partId) != p._key
        REMOVE { _key: p._key } IN parts
    `;



consistencyLib.execQuery(re)
