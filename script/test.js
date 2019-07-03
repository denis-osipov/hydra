/*

Compare Hydra's results with ERICA's results

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
    hydraResults = new Result(setting);
    hydraResults.fillGaps();
    hydraResults.getCoefficients();
    hydraResults.getInternal();
    hydraResults.getExternal();
    hydraResults.getTotal();

    for (isotope in standardResults) {
        for (organism in standardResults[isotope]) {
            if (standardResults[isotope][organism] !== hydraResults.getTotalDoseRate(isotope, organism)) {
                console.log(`${isotope}:${organism}: standard = ${standardResults[isotope][organism]}, hydra: ${hydraResults.getTotalDoseRate(isotope, organism)}`);
            }
        }
    }
};

compareBtn.addEventListener("click", compare);
