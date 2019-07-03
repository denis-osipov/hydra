/*

Compare Hydra's results with ERICA's results

*/

var standardResults = {};

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
