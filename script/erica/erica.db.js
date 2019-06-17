/*

Script for creating SQLite database file from CSV with ERICA's data
with sql.js v1.0.0 (https://github.com/kripken/sql.js).

*/

//Open a blank database
var db;
initSqlJs({ locateFile: filename => `../dist/${filename}` }).then(function (SQL) {
    db = new SQL.Database();
});