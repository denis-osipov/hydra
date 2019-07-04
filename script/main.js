/*

Make all stuff work.

*/

// Create new setting
var setting = new Setting();
var result;
var output = document.getElementById("results");

var appFrame = document.getElementsByClassName("app-frame")[0];


// Update list elements
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


// organisms fieldset
var allOrganisms = document.getElementById("all-organisms");
// TODO: wait until erica data will be filled
setTimeout(function() {
    addCheckbox(allOrganisms, erica.organisms)
}, 1000);

// isotopes fieldset
var allIsotopes = document.getElementById("all-isotopes");
// TODO: wait until erica data will be filled
setTimeout(function() {
    addCheckbox(allIsotopes, erica.isotopes)
}, 1000);

// Calculate button
var calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", function() {
    result = new Result(setting);
    result.calculate();
});
