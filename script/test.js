/*

Compare HYDRA's results with ERICA's results

*/

var standardResults = {};
var hydraResults;

var standardFile = document.getElementById("standard");

var readTable = function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
        var lines = this.result.split("\r\n");

        // In ERICA's results organisms are in first row with first empty cell
        var organisms = lines[0].split(";").slice(1);

        var data = lines.slice(1);
        for (row of data) {
            var cells = row.split(";");

            // Isotopes are in first column
            var isotope = cells[0];
            standardResults[isotope] = {};
            for (var i = 0; i < organisms.length; i++) {
                standardResults[isotope][organisms[i]] = parseFloat(cells[i + 1]);
            }
        }
    };
    reader.readAsText(file);
};

standardFile.addEventListener("change", readTable);


var compareBtn = document.getElementById("compare");

var compare = function() {
    for (isotope of erica.isotopes) {
        setting.addIsotope(isotope);
        setting.setActivityConcentration(isotope, "Water", 1);
    }
    for (organism of erica.organisms) {
        setting.addOrganism(organism);
    }
    var result = new Result(setting);
    result.fillGaps();
    result.getCoefficients();
    result.getInternal();
    result.getExternal();
    result.getTotal();
    hydraResults = result.totalDoseRates;

    for (isotope in standardResults) {
        for (organism in standardResults[isotope]) {
            /* HYDRA's results are slightly different compare ERICA's sandart values.
            It can be result of floating point ariphmetic errors in HYDRA.
            Check that results don't differ too much.
            Difference not more than 0.05% of ERICA's value seems good enough.*/
            var standard = standardResults[isotope][organism];
            var checking = hydraResults[isotope][organism];
            var diff = Math.abs(standard - checking);
            if (diff >= standard * 0.0005) {
                console.log(`${isotope}:${organism}:`);
                console.log(`ERICA: ${standard}, HYDRA: ${checking}`);
            }
        }
    }
    console.log("Done");
};

compareBtn.addEventListener("click", compare);
