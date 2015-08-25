var low = require('lowdb');
var db = low('db.json');

module.exports = db;