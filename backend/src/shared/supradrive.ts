require('dotenv').config();
const supradrivesql = require('mysql2/promise');
const supradrive = supradrivesql.createPool({
  Promise: require('bluebird'),
  host: process.env.DBSUPRADRIVEHOST,
  user: process.env.DBSUPRADRIVEUSER,
  password: process.env.DBSUPRADRIVEPASS,
  database: process.env.DBSUPRADRIVE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
supradrive.on('connection', function (connection) {
  console.log("\x1b[1m\x1b[30m[DATABASE] [\x1b[32mOK\x1b[30m] [\x1b[35mSYSTEM\x1b[30m] => \x1b[32mCONNECTED\x1b[30m => \x1b[36mCONNECTED\x1b[0m");
  connection.on('error', function (err) {
    console.log("\x1b[1m\x1b[30m[DATABASE] [\x1b[31mERROR\x1b[30m] [\x1b[35mSYSTEM\x1b[30m] => \x1b[31mERROR\x1b[30m => \x1b[31m" + err.code + "\x1b[0m");
  });
  connection.on('close', function (err) {
    console.log("\x1b[1m\x1b[30m[DATABASE] [\x1b[31mERROR\x1b[30m] [\x1b[35mSYSTEM\x1b[30m] => \x1b[31mERROR\x1b[30m => \x1b[36m" + err + "\x1b[0m");
    console.error(new Date(), 'MySQL close', err);
  });
});
module.exports = supradrive;
