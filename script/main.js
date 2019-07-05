/*

Make all stuff work.

*/

// Create new setting
var setting = new Setting();
var result;
var output = document.getElementById("results");

var appFrame = document.getElementsByClassName("app-frame")[0];


// Settings
var organismsList = document.getElementById("organisms");
organismsList.parentElement.addEventListener("click", function() {
    var container = showInput(appFrame, "organisms", setting);
    container.className = "input-box";
});
var isotopesList = document.getElementById("isotopes");
isotopesList.parentElement.addEventListener("click", function() {
    var container = showInput(appFrame, "isotopes", setting);
    container.className = "input-box";
});
var concentrationRatios = document.getElementById("c-ratios");
concentrationRatios.addEventListener("click", function() {
    var container = showInput(appFrame, "CRs", setting);
    container.className = "input-box";
});
var distributionCoefficients = document.getElementById("k-ratios");
distributionCoefficients.addEventListener("click", function() {
    var container = showInput(appFrame, "Kds", setting);
    container.className = "input-box";
});
var percentageDryWeight = document.getElementById("dry-weight");
percentageDryWeight.addEventListener("click", function() {
    var container = showInput(appFrame, "dry", setting);
    container.className = "input-box";
});
var weightingFactors = document.getElementById("wfs");
weightingFactors.addEventListener("click", function() {
    var container = showInput(appFrame, "WFs", setting);
    container.className = "input-box";
});


// Fieldsets
var allOrganisms = document.getElementById("all-organisms");
var allIsotopes = document.getElementById("all-isotopes");

var checker = setInterval(function() {
    if (isEricaReady) {
        addCheckbox(allOrganisms, "organisms", setting, organismsList);
        addCheckbox(allIsotopes, "isotopes", setting, isotopesList);
        clearInterval(checker);
    }
    else {
        console.log("Waiting for ERICA");
    }
}, 500);

// Calculate button
var calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", function() {
    result = new Result(setting);
    result.calculate();
    
    var table = generateTable("output", result);
    if (output.childElementCount) {
        output.removeChild(output.children[0]);
    }
    else {
        output.textContent = "";
    }
    if (table.tHead.textContent) {
        output.appendChild(table);
    }
    else {
        output.textContent = "No data";
    }
});
