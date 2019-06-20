/*

ERICA Assessment Tool data

*/

var db;

var initSqlJs = window.initSqlJs;

initSqlJs({ locateFile: filename => `./script/sql.js/${filename}` }).then(SQL => {

    // Get data from database
    var request = new XMLHttpRequest();
    request.open("GET", "data/erica.db");
    request.responseType = "arraybuffer";
    request.onload = function() {
        var dataArray = new Uint8Array(this.response);
        db = new SQL.Database(dataArray);
    };
    request.send();
});
