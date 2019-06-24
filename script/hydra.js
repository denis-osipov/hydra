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
    this.media = ["Water", "Sediment"];
    this.habitats = {
            "Water-surface": [0.5, 0.0],
            "Water": [1.0, 0.0],
            "Sediment-surface": [0.5, 0.5],
            "Sediment": [0.0, 1.0]
        };
    this.occupancyFactors = {};
    this.radiationWeightingFactors = [10.0, 1.0, 3.0];
    this.activityConcentrations = {};
    this.percentageDryWeight = 100;
    this.doseConversionCoefficients = {};
};

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

/*
Set radiation weighting factors
values must be an array of 3 floats in [0, +inf) in order:
    - alpha
    - beta/gamma
    - low beta
*/
Setting.prototype.setRadiationWeightingFactors = function(values) {
    this.radiationWeightingFactors = values;
};

// Set activity concentrations
Setting.prototype.setActivityConcentrations = function(isotope, object, value) {
    this.activityConcentrations[isotope] = {};
    this.activityConcentrations[isotope][object] = value;
};

// Set percentage dry weight value for soil (value in [0, 100])
Setting.prototype.setPercentageDryWeight = function(value) {
    this.percentageDryWeight = value;
};

/*
Set dose conversion coefficients
values must be an array of 6 floats in [0, +inf) in order:
    - internal alpha
    - internal beta/gamma
    - internal low beta
    - external alpha
    - external beta/gamma
    - external low beta
*/
Setting.prototype.setDoseConversionCoefficients = function(isotope, organism, values) {
    this.doseConversionCoefficients[isotope] = {};
    this.doseConversionCoefficients[isotope][organism] = values;
}


// Result
var Result = function(setting) {
    // Make deep clone of setting to not alter it during calculation
    var deepClone = JSON.parse(JSON.stringify(setting, function(key, value) {
        // Convert sets to arrays (JSON.stringify doesn't work with sets)
        if (value instanceof Set) {
            return Array.from(value);
        }
        return value;
    }));
    for (property in deepClone) {
        this[property] = deepClone[property];
    }
};

// Fill missing data using ERICA's coefficients
Result.prototype.fillGaps = function(setting) {
    for (isotope of this.isotopes) {

        // Stop if there is no data about some isotope
        if (!this.activityConcentrations[isotope]) {
            console.log(`Can't find any data for ${isotope}`);
            continue;
        }

        // Fill Kd and activity concentrations for water and sediment
        // Perform calculations using data only for water or sediment
        var nuclide = isotope.split("-")[0];
        if (!this.distributionCoefficients[nuclide]) {
            this.distributionCoefficients[nuclide] = erica.kd[nuclide];
        }
        
        var kd = this.distributionCoefficients[nuclide];
        var activity = this.activityConcentrations[isotope];

        if (!activity["Water"] && activity["Sediment"]) {
            activity["Water"] = activity["Sediment"] / kd;
        }

        if (!activity["Sediment"] && activity["Water"]) {
            activity["Sediment"] = activity["Water"] * kd;
        }

        // Fill CR, activity concentrations and DCC for organisms
        if (!this.concentrationRatios[nuclide]) {
            this.concentrationRatios[nuclide] = {};
        }
        var cr = this.concentrationRatios[nuclide];

        if (!this.doseConversionCoefficients[isotope]) {
            this.doseConversionCoefficients[isotope] = {};
        }
        var dcc = this.doseConversionCoefficients[isotope];

        for (organism of this.organisms) {
            if (!cr[organism]) {
                cr[organism] = erica.cr[nuclide][organism];
            }
            if (!activity[organism] && activity["Water"]) {
                activity[organism] = activity["Water"] * cr[organism];
            }
            if (!dcc[organism]) {
                dcc[organism] = erica.dcc[isotope][organism];
            }
        }

    }

    // Fill occupancy factors
    for (organism of this.organisms) {
        if (!this.occupancyFactors[organism]) {
            this.occupancyFactors[organism] = erica.occ[organism];
        }
    }

};

// Get summary coefficients for calculations
Result.prototype.getCoefficients = function() {
    // Use aliases
    var dcc = this.doseConversionCoefficients;
    var wf = this.radiationWeightingFactors;

    this.internalCoefficients = {};
    this.externalCoefficients = {};
    
    for (isotope of this.isotopes) {
        this.internalCoefficients[isotope] = {};
        this.externalCoefficients[isotope] = {};
        for (organism of this.organisms) {
            coefs = [];
            dcc[isotope][organism].forEach(function(value, index) {
                coefs.push(value * wf[index % wf.length]);
            });
            this.internalCoefficients[isotope][organism] = coefs[0] + coefs[1] + coefs[2];
            this.externalCoefficients[isotope][organism] = coefs[3] + coefs[4] + coefs[5];
        }
    }
};

// Calculate internal dose rates
Result.prototype.getInternal = function() {
    this.internalDoseRates = {};
};

// Calculate dose rates
Result.prototype.calculate = function() {
    // Get missing data
    this.fillGaps();

    // Get summary coefficients
    this.getCoefficients();

    // Calculate internal dose rates
    this.getInternal();
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
    addItemSelector(e, erica.organisms)
});

// isotopes fieldset
var addIsotopeButton = document.getElementById("add-isotope");
addIsotopeButton.addEventListener("click", function(e){
    addItemSelector(e, erica.isotopes)
});

// Calculate button
var calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", setting.calculate);
