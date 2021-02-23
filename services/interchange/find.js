const interchangeModel = require('../../models/interchange/interchanges_v2');

const convertPartForEcommerce = (part) => ({
    'id': part.sku,
    'manufacturer': part.manufacturer,
    'partType': part.partType,
    'description': part.description,
    'part_number': part.partNumber,
    'inactive': false
});

const find = async (id) => findPage(id, 0, Number.MAX_SAFE_INTEGER);

const findEcommerce = async (id) => (await interchangeModel.find(id)).map(it => convertPartForEcommerce(it));

const findPage = async (id, offset, limit) => {
    const [headers, parts] = await Promise.all([interchangeModel.findHeaderByItemId(id), interchangeModel.findPage(id, offset, limit)]);
    return {
        headerId: headers[0].key,
        parts: parts
    };
}

const findByHeaderId = async (headerId) => await interchangeModel.findByHeaderId(headerId);


exports.find = find;
exports.findEcommerce = findEcommerce;
exports.findPage = findPage;
exports.findByHeaderId = findByHeaderId;