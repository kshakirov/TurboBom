var mysql = require('promise-mysql');
var config = require('config');
var dbConfig = config.get('Mysql');
var part_model = require('../../models/part')

var connection;
var part_types;
var manufacturers;
var parts;


function cmp_manufcaturer(m_part, g_part, manufacturers) {
    var m_manfr = manufacturers[m_part.manfr_id - 1].name;
    var g_manfr = g_part.manufacturer;
    return m_manfr == g_manfr
}

function cmp_part_type(m_part, g_part, part_types) {
    var m_part_type = part_types[m_part.part_type_id - 1].name;
    var g_part_type = g_part.partType;
    return m_part_type == g_part_type
}

function cmp_part_number(m_part, g_part) {
    var m_name = m_part.manfr_part_num;
    var g_name = g_part.partNumber;
    return m_name == g_name
}


function _create_graph_part_body(m_part, manufacturers, part_types) {
    var part_body = {
        manufacturer: manufacturers[m_part.manfr_id - 1].name,
        description: m_part.description,
        partType: part_types[m_part.part_type_id - 1].name,
        partNumber: m_part.manfr_part_num,
        name: m_part.name,
    };
    return part_body
}


mysql.createConnection({
    host     :dbConfig.host,
    user     : dbConfig.user,
    password : dbConfig.password,
    database : dbConfig.database
}).then(function(conn){
    connection  = conn;

    return connection.query('SELECT * from  part_type  order by id');
}).then(function (promise) {
    part_types = promise;
    return connection.query('SELECT * from  manfr order by id')

}).then(function (promise) {
    manufacturers = promise;
    return connection.query('SELECT * from  part')
}).then(function (promise) {
    parts = promise;
    connection.end()
    parts.forEach(function (part) {
        part_model.getPart(part.id.toString()).then(function (g_part) {
            var m_part = part;
            var match = true;
            console.log(`graph part  [${g_part._key}] => mysql part [${m_part.id}]`);
            if (!cmp_manufcaturer(m_part, g_part, manufacturers)){
                console.log("Manufacturer Does Not Match");
                match=false;
            };
            if(!cmp_part_type(m_part, g_part, part_types)){
                console.log("Part Type Does Not Match")
                match=false;
            }

            if(!cmp_part_number(m_part, g_part)){
                console.log("Part Number Does Not Match")
                match=false;
            }
            if(!match){
                part_model.updatePart(m_part.id.toString(), _create_graph_part_body(m_part, manufacturers, part_types) )
            }
        })
    })
})





