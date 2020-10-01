let salesNotes = require('../models/sales_notes_v2');


let formatDate = (salesNotes) => salesNotes.map(salesNote => {
    var date = new Date(salesNote.create_date);
    var formattedDate = (date.getMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getFullYear();
    salesNote.create_date = formattedDate;
    return salesNote;
});

let findSalesNotes = async (req, res) => {
    let salesNotesResponse = (await salesNotes.getSalesNotes(req.params.id))[0];
    if(salesNotesResponse) {
        salesNotesResponse.salesNotes.forEach(it => {
            it.partNumber = salesNotesResponse.partNumber;
            it.sku = salesNotesResponse.sku;
        })
        delete salesNotesResponse.partNumber;
        delete salesNotesResponse.sku;
        res.json(formatDate(salesNotesResponse.salesNotes));
    } else {
        res.json();
    }
}

let findSalesNotesForSkus = async (skus) => {
    let salesNotesResponse = (await Promise.all(skus.map(it => salesNotes.getSalesNotes(it)))).map(it => it[0]).filter(it => it.salesNotes);
    salesNotesResponse.forEach(outer => {
        outer.salesNotes.forEach(it => {
            it.partNumber = outer.partNumber;
            it.sku = outer.sku;
        })
        delete outer.partNumber;
        delete outer.sku;
    })
    salesNotesResponse = salesNotesResponse.map(it => it.salesNotes);
    salesNotesResponse = salesNotesResponse.reduce((a,b) => a.concat(b));
    if(salesNotesResponse) {
        return formatDate(salesNotesResponse);
    } else {
        return [];
    }
}


exports.findSalesNotes = findSalesNotes;
exports.findSalesNotesForSkus = findSalesNotesForSkus;