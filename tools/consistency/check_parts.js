let consistencyLib =require('./consistency_lib'),
    queries = [
        {
            msg: "Checking whether all parts are processed",
            query: `let pps = (for p in parts filter p.sku == null  return p)
                                RETURN LENGTH(pps)`,
            expected: [0]
        }
        ,
        {
            msg: "Checking if there're  double keys",
            query: `let pps = (for p in parts filter p.sku == null  return p)
                                RETURN LENGTH(pps)`,
            expected: [0]
        },
        {
            msg: "Checking if there're  ",
            query: `let pps = (for p in parts filter p.manufacturerId > 12 return p)
                            RETURN LENGTH(pps)`,
            expected: [0]
        }

    ];


async function asyncForEach(queries) {
    for (let index = 0; index < queries.length; index++) {
        const result = await consistencyLib.execQuery(queries[index].query);
        if(typeof result==='object'&& result.length===queries[index].expected.length &&
        result[0]==queries[index].expected[0]){
            console.log("OK")
        }else{
            console.log(`Expected ${queries[index].expected} but got ${result}`)
        }
    }
}


asyncForEach(queries);

