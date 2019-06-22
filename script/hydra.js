/*

Script for dose rate calculation.

Uses ERICA Assessment Tool's assets.
ERICA version 1.3.1.33

*/

// Setting
var Setting = function() {
    this.parameters = {
        isotopes = new Set(),
        organisms = new Set(),
        distributionCoefficients = {},
        concentrationRatios = {},
        media = ["Water", "Sediment"],
        habitats = {
            "Water-surface": [0.5, 0.0],
            "Water": [1.0, 0.0],
            "Sediment-surface": [0.5, 0.5],
            "Sediment": [0.0, 1.0]
        },
        occupancyFactors = {},
        radiationWeightingFactors = [10.0, 1.0, 3.0],
        activityConcentrations = {},
        percentageDryWeight = 100,
        doseConversionCoefficients = {},
    };

};

// Add isotopes and organisms to setting
Setting.prototype.addIsotope = function(isotope) {
    this.parameters.isotopes.add(isotope);
};

Setting.prototype.addOrganism = function(organism) {
    this.parameters.organisms.add(organism);
};

// Set radioecology parameters
Setting.prototype.setDistributionCoefficients = function(nuclide, value) {
    this.parameters.distributionCoefficients[nuclide] = value;
};

Setting.prototype.setConcentrationRatios = function(nuclide, organism, value) {
    this.parameters.concentrationRatios[nuclide] = {};
    this.parameters.concentrationRatios[nuclide][organism] = value;
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
    this.parameters.occupancyFactors[organism] = values;
};

/* Set radiation weighting factors
values must be an array of 3 floats in [0, +inf) in order:
    - alpha
    - beta/gamma
    - low beta
*/
Setting.prototype.setRadiationWeightingFactors = function(values) {
    this.parameters.radiationWeightingFactors = values;
};

// Set activity concentrations
Setting.prototype.setActivityConcentrations = function(isotope, object, value) {
    this.parameters.activityConcentrations[isotope] = {};
    this.parameters.activityConcentrations[isotope][object] = value;
};

// Set percentage dry weight value for soil (value in [0, 100])
Setting.prototype.setPercentageDryWeight = function(value) {
    this.parameters.percentageDryWeight = value;
};

// Set dose conversion coefficients
Setting.prototype.setDoseConversionCoefficients = function(isotope, organism, value) {
    this.parameters.doseConversionCoefficients[isotope] = {};
    this.parameters.doseConversionCoefficients[isotope][organism] = value;
}


// Result
var Result = function(setting) {
    for (parameter in setting.parameters) {
        this[parameter] = setting.parameters[parameter];
    }
};

Result.prototype.fillGaps = function(setting) {
    // filling missing data
};

// Calculate dose rates
Result.prototype.calculate = function() {
    this.fillGaps();

    // calculation
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
