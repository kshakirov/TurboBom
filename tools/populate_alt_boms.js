let fs = require('fs'),
    altBomModel = require('../models/alternative_bom'),
    config = require('config'),
    dbConfig = config.get('TurboGraph.dbConfig');

let data = fs.readFileSync(dbConfig.dumpFile);
let parts = JSON.parse(data);


let alternatives = parts.filter(function (part) {
    let parent_id = part.id;
    if (part.boms.length > 0) {
        part.boms.map((bom) => {
            let child_id = bom.child.id,
                header_id = parent_id;
            if (bom.alternatives.length > 0) {
                altBomModel.addAltInterchangeHeader(header_id, parent_id).then(() => {
                    altBomModel.addPartrToAltGroup(parent_id, child_id, child_id, header_id).then(() => {
                        bom.alternatives.map((alt) => {
                            let part_id = alt.part_id;
                            let info = {
                                parent_id: parent_id,
                                child_id: child_id,
                                part_id: part_id,
                                header_id: header_id
                            };
                            altBomModel.addAlternativeBom(parent_id, child_id, part_id,
                                header_id).then(() => {
                                console.log(`Added [${part_id}] Alternative To Header [${header_id}]`);
                            }, () => {
                                console.log("Error");
                                console.log(info)
                            })
                        })
                    }, () => {
                        console.log(`Error Part To Group ${parent_id} =>   ${child_id} `)
                    })

                }, () => {
                    console.log(`Error Creating Header  [ ${child_id}] for parent [${parent_id}] `);
                })
            }
        })
    }
});


