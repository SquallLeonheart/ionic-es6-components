var low = require('lowdb');
var db = low('track-db.json');

module.exports = db;
