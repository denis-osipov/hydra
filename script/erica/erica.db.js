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
var toCreate = document.getElementById("to-create");
var toPreprocess = document.getElementById("to-preprocess");

var createTables = function() {
    const fileList = this.files;
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        let name = file.name.split(".")[0];
        var reader = new FileReader();
        reader.onload = function(event) {

            var lines = this.result.split("\r\n");

            /* SQLite implicitly set "rowid" column, that uniquely identifies
            each row within the table. So, we don't need to set PRIMARY KEY*/
            db.run(`CREATE TABLE ${name} (${lines[0].replace(/;/g, ",")})`);
            var headers = lines[0].split(";");

            // Insert data
            var headerNames = [];
            var headerTypes = [];
            for (var i = 0; i < headers.length; i++) {
                var header = headers[i].split(" ");
                headerNames.push(header[0]);
                headerTypes.push(header[1])
            }
            var valuePlaceholder = Array(headerNames.length);
            valuePlaceholder.fill("?");
            var stmt = db.prepare(
                `INSERT INTO ${name} VALUES (${valuePlaceholder});`
                );
            for (var i = 1; i < lines.length; i++) {
                var values = lines[i].split(";");
                values.forEach(function(element, index, array) {
                    if (headerTypes[index] === "REAL") {
                        element = parseFloat(element);
                    }
                });
                stmt.run(values);
            }
            stmt.free();
        }
        reader.readAsText(file);
    }
};

var preprocessTable = function(){

};

toCreate.addEventListener("change", createTables);
toPreprocess.addEventListener("change", preprocessTable);
