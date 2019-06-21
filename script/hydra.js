/*

Script for dose rate calculation.

Uses ERICA Assessment Tool's assets.
ERICA version 1.3.1.33

*/

// Setting
var Setting = function() {
    this.isotopes = new Set();
    this.organisms = new Set();
    this.distributionCoefficients = {};
    this.concentrationRatios = {};
    this.media = [];
    this.habitats = [];
    this.occupancyFactors = [];
    this.radiationWeightingFactors = [];
    this.activityConcentrations = {};
    this.percentageDryWeight = null;
    this.doseRates = {};
};

// Spatial and temporal series
Setting.prototype.addSeries = function(setting, type) {};

// Add isotopes and organisms to setting
Setting.prototype.addIsotope = function(isotope) {
    this.isotopes.add(isotope);
};

Setting.prototype.addOrganism = function(organism) {
    this.organisms.add(organism);
};

// Set radioecology parameters
Setting.prototype.setDistributionCoefficients = function(nuclide, value) {
    this.distributionCoefficients[nuclide] = value;
};

Setting.prototype.setConcentrationRatios = function(nuclide, organism, value) {
    this.concentrationRatios[nuclide] = {};
    this.concentrationRatios[nuclide][organism] = value;
};

/*
Set occupancy factors
values must be an array of 4 floats in [0, 1] in order:
    - Water-surface
    - Water
    - Sediment-surface
    - Sediment
*/
Setting.prototype.setOccupancyFactors = function(organism, values) {
    this.occupancyFactors[organism] = values;
};

/* Set radiation weighting factors
values must be an array of 3 floats in [0, +inf) in order:
    - alpha
    - beta/gamma
    - low beta
*/
Setting.prototype.setRadiationWeightingFactors = function(values) {
    this.radiationWeightingFactors = values;
};

// Set activity concentrations
Setting.prototype.setActivityConcentrations = function(nuclide, object, value) {
    this.activityConcentrations[nuclide] = {};
    this.activityConcentrations[nuclide][object] = value;
};

// Set percentage dry weight value for soil (value in [0, 100])
Setting.prototype.setPercentageDryWeight = function(value) {
    this.percentageDryWeight = value;
};

// Fill missing activity concentrations
Setting.prototype.fillActivityConcentrations = function(nuclide) {
    console.log(nuclide);
};

// Calculate dose rates
Setting.prototype.calculate = function() {
    this.isotopes.forEach(this.fillActivityConcentrations);
};


// Create new setting
var setting = new Setting();

// Add item selector right before target element (button)
var addItemSelector = function(event, array) {

    // Parent container
    var newItemSelector = document.createElement("div");
    newItemSelector.className = "selector";  // for styling

    // Selector
    var selector = document.createElement("select");
    for (var i = 0; i < array.length; i++) {
        var option = document.createElement("option");
        option.textContent = array[i];
        selector.appendChild(option);
    }
    newItemSelector.appendChild(selector);

    // Item button
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "^";
    button.addEventListener("click", function(e) {
        var value = e.target.previousSibling.value;
        if (event.target.id === "add-isotope") {
            setting.addIsotope(value);
        }
        else {
            setting.addOrganism(value);
        }
    });
    newItemSelector.appendChild(button);

    var target = event.target;
    target.parentNode.insertBefore(newItemSelector, target);
};

// organisms fieldset
var addOrganismButton = document.getElementById("add-organism");
addOrganismButton.addEventListener("click", function(e){
    addItemSelector(e, organisms)
});

// isotopes fieldset
var addIsotopeButton = document.getElementById("add-isotope");
addIsotopeButton.addEventListener("click", function(e){
    addItemSelector(e, isotopes)
});

// Calculate button
var calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", setting.calculate);
