let salesNotes = require('../models/sales_notes_v2');

const config = require('config');
const redisConfig = config.get('TurboGraph_v2.Cache.redis');
const redis = require('async-redis');
const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

let formatDate = (salesNotes) => salesNotes.map(salesNote => {
    var date = new Date(salesNote.create_date);
    var formattedDate = (date.getMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getFullYear();
    salesNote.create_date = formattedDate;
    return salesNote;
});

const SALES_NOTES_PREFIX = 'sales_notes_';
let findSalesNotes = async (req, res) => {
    let value = await redisClient.get(SALES_NOTES_PREFIX + req.params.id);
    if(!value || JSON.parse(value).length == 0) {
        let salesNotesResponse = (await salesNotes.getSalesNotes(req.params.id))[0];
        if(salesNotesResponse && salesNotesResponse.salesNotes) {
            salesNotesResponse.salesNotes.forEach(it => {
                it.partNumber = salesNotesResponse.partNumber;
                it.sku = salesNotesResponse.sku;
            })
            delete salesNotesResponse.partNumber;
            delete salesNotesResponse.sku;
            value = formatDate(salesNotesResponse.salesNotes);
            await redisClient.set(SALES_NOTES_PREFIX + req.params.id, JSON.stringify(value), 'EX', redisConfig.ttl);
        }
    } else {
        value = JSON.parse(value);
    }
    res.json(value ? value : {});
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
    salesNotesResponse = salesNotesResponse.length > 0 ? salesNotesResponse.reduce((a,b) => a.concat(b)) : null;
    if(salesNotesResponse) {
        return formatDate(salesNotesResponse);
    } else {
        return [];
    }
}


exports.findSalesNotes = findSalesNotes;
exports.findSalesNotesForSkus = findSalesNotesForSkus;