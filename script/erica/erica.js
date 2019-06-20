/*

ERICA Assessment Tool data

*/

var db;
var dcc = {};
var organisms = [];
var isotopes = [];

var initSqlJs = window.initSqlJs;

initSqlJs({ locateFile: filename => `./script/sql.js/${filename}` }).then(SQL => {

    // Get data from database
    var request = new XMLHttpRequest();
    request.open("GET", "data/erica.db");
    request.responseType = "arraybuffer";
    request.onload = function() {
        var dataArray = new Uint8Array(this.response);
        db = new SQL.Database(dataArray);

        //Get organisms and isotopes
        db.each("SELECT name FROM organisms;", function(row) {
            organisms.push(row.name);
        })

        db.each("SELECT name FROM isotopes;", function(row) {
            isotopes.push(row.name);
        })

        // Get DCCs
        db.each("SELECT * FROM dcc;", function(row) {
            if (!dcc[row.organism]) {
                dcc[row.organism] = {};
            }
            dcc[row.organism][row.isotope] = {
                int_alpha: row.int_alpha,
                int_beta_gamma: row.int_beta_gamma,
                ext_low_beta: row.ext_low_beta,
                ext_beta_gamma: row.ext_beta_gamma,
                int_low_beta: row.int_low_beta
            };
        });
    };
    request.send();
});
