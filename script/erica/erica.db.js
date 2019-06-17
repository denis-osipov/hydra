/*

Script for creating SQLite database file from CSV with ERICA's data
with sql.js v1.0.0 (https://github.com/kripken/sql.js).

*/

// Open a blank database
var db;
initSqlJs({ locateFile: filename => `./script/sql.js/${filename}` }).then(function (SQL) {
    db = new SQL.Database();
});


// Handle files
var inputElement = document.getElementById("input");

var handleFiles = function() {
    const fileList = this.files;
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        let name = file.name.split(".")[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create table
            var sql = `CREATE TABLE ${name} (id INTEGER PRIMARY KEY`;
            var lines = this.result.split("\r\n");
            var headers = lines[0].split(";");
            for (var j = 0; j < headers.length; j++) {
                sql += `, ${headers[j]}`;
            }
            sql += ");";
            db.run(sql);

            // Insert data
            var headerNames = [];
            for (var i = 0; i < headers.length; i++) {
                headerNames.push(headers[i].split(" ")[0]);
            }
            var stmt = db.prepare(`INSERT INTO ${name} (${headerNames}) VALUES (?);`);
            for (var i = 1; i < lines.length; i++) {
                stmt.run([lines[i]]);
            }
        }
        reader.readAsText(file);
    }
};

inputElement.addEventListener("change", handleFiles);
