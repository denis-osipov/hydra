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
        console.log(file.name);
    }
};

inputElement.addEventListener("change", handleFiles);