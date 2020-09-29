let salesNotes = require('../models/sales_notes_v2');


let findSalesNotes = async (req, res) => {
    let salesNotesResponse = (await salesNotes.getSalesNotes(req.params.id))[0];
    if(salesNotesResponse) {
        res.json(salesNotesResponse.map(salesNote => {
            var date = new Date(salesNote.create_date);
            var formattedDate = (date.getMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getFullYear();
            salesNote.create_date = formattedDate;
            return salesNote;
        }));
    } else {
        res.json();
    }
}


exports.findSalesNotes = findSalesNotes;