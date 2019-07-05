/*

Parse ERICA Assessment Tool data

*/

var erica = {};
var isEricaReady = false;

initSqlJs({ locateFile: filename => `./script/sql.js/${filename}` }).then(SQL => {

    // Get data from database
    var request = new XMLHttpRequest();
    request.open("GET", "data/erica.db");
    request.responseType = "arraybuffer";
    request.onload = function() {
        var dataArray = new Uint8Array(this.response);
        var db = new SQL.Database(dataArray);

        //Get organisms and isotopes
        erica.organisms = [];
        db.each("SELECT name FROM organisms;", function(row) {
            erica.organisms.push(row.name);
        });

        erica.isotopes = [];
        db.each("SELECT name FROM isotopes;", function(row) {
            erica.isotopes.push(row.name);
        });

        // Get DCCs
        erica.dcc = {};
        db.each("SELECT * FROM dcc;", function(row) {
            if (!erica.dcc[row.isotope]) {
                erica.dcc[row.isotope] = {};
            }
            erica.dcc[row.isotope][row.organism] = [
                row.int_alpha,
                row.int_beta_gamma,
                row.int_low_beta,
                0, // external alpha not used by ERICA
                row.ext_beta_gamma,
                row.ext_low_beta
            ];
        });

        // Get radioecology parameters, Kd and CR
        erica.kd = {};
        db.each("SELECT * FROM kd;", function(row) {
            erica.kd[row.nuclide] = row.value;
        });

        erica.cr = {};
        db.each("SELECT * FROM cr;", function(row) {
            if (!erica.cr[row.nuclide]) {
                erica.cr[row.nuclide] = {};
            }
            erica.cr[row.nuclide][row.organism] = row.value;
        });

        // Get occupancy factors
        erica.occ = {};
        db.each("SELECT * FROM occ;", function(row) {
            if (!erica.occ[row.organism]) {
                erica.occ[row.organism] = {};
            }
            erica.occ[row.organism][row.habitat] = row.value;
        });
        isEricaReady = true;
    };
    request.send();
});
