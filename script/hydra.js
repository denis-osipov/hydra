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

// Isotopes adder and getter
Setting.prototype.addIsotope = function(isotope) {
    this.isotopes.add(isotope);
};

// Get isotopes as array
Setting.prototype.getIsotopes = function() {
    return Array.from(this.isotopes);
};

// Get nuclides list
Setting.prototype.getNuclides = function() {
    var nuclides = this.getIsotopes();
    nuclides.forEach(function(value, index, array) {
        array[index] = value.split("-")[0];
    });
    return nuclides;
};

// Organisms adder and getter
Setting.prototype.addOrganism = function(organism) {
    this.organisms.add(organism);
};

Setting.prototype.getOrganisms = function() {
    return Array.from(this.organisms);
};

// Set and get radioecology parameters
// text added for uniformity with other getters/setters
Setting.prototype.setDistributionCoefficient = function(nuclide, text, value) {
    this.distributionCoefficients[nuclide] = value;
};

Setting.prototype.getDistributionCoefficient = function(nuclide, text) {
    return this.distributionCoefficients[nuclide];
};

Setting.prototype.setConcentrationRatio = function(nuclide, object, value) {
    if (!this.concentrationRatios[nuclide]) {
        this.concentrationRatios[nuclide] = {};
    }
    this.concentrationRatios[nuclide][object] = value;
};

Setting.prototype.getConcentrationRatio = function(nuclide, object) {
    if (object) {
        return this.concentrationRatios[nuclide][object];
    }
    else {
        return this.concentrationRatios[nuclide];
    }
};

/*
Set and get occupancy factors
value must be a float in [0, 1].
Habitats: Water-surface, Water, Sediment-surface, Sediment
*/
Setting.prototype.setOccupancyFactor = function(organism, habitat, value) {
    if (!this.occupancyFactors[organism]) {
        this.occupancyFactors[organism] = {};
    }
    this.occupancyFactors[organism][habitat] = value;
};

Setting.prototype.getOccupancyFactor = function(organism, habitat) {
    if (habitat) {
        return this.occupancyFactors[organism][habitat];
    }
    else {
        return this.occupancyFactors[organism];
    }
};

/*
Set and get radiation weighting factors
values must be an array of 3 floats in [0, +inf) in order:
    - alpha
    - beta/gamma
    - low beta
*/
Setting.prototype.setRadiationWeightingFactors = function(values) {
    this.radiationWeightingFactors = values;
};

Setting.prototype.getRadiationWeightingFactors = function() {
    return this.radiationWeightingFactors;
};

// Set and get activity concentrations
Setting.prototype.setActivityConcentration = function(isotope, object, value) {
    if (!this.activityConcentrations[isotope]) {
        this.activityConcentrations[isotope] = {};
    }
    this.activityConcentrations[isotope][object] = value;
};

Setting.prototype.getActivityConcentration = function(isotope, object) {
    if (object) {
        return this.activityConcentrations[isotope][object];
    }
    else {
        return this.activityConcentrations[isotope];
    }
};

// Set and get percentage dry weight value for soil (value in [0, 100])
// texts added for uniformity with other setters
Setting.prototype.setPercentageDryWeight = function(text1, text2, value) {
    this.percentageDryWeight = value;
};

Setting.prototype.getPercentageDryWeight = function() {
    return this.percentageDryWeight;
};

/*
Set and get dose conversion coefficients
values must be an array of 6 floats in [0, +inf) in order:
    - internal alpha
    - internal beta/gamma
    - internal low beta
    - external alpha
    - external beta/gamma
    - external low beta
*/
Setting.prototype.setDoseConversionCoefficients = function(isotope, organism, values) {
    if (!this.doseConversionCoefficients[isotope]) {
        this.doseConversionCoefficients[isotope] = {};
    }
    this.doseConversionCoefficients[isotope][organism] = values;
}

Setting.prototype.getDoseConversionCoefficients = function(isotope, organism) {
    return this.doseConversionCoefficients[isotope][organism];
};


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
        if (!this.activityConcentrations[isotope] ||
            Object.values(this.activityConcentrations[isotope]).every(function(value) {
                return isNaN(value) || value === null;
            })) {
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
        var factors = this.occupancyFactors[organism];
        if (Object.values(factors).every(function(value) {
            return isNaN(value) || value === null;
        })) {
            factors = erica.occ[organism];
        }
        else {
            for (habitat in factors) {
                if (isNaN(factors[habitat]) || factors[habitat] === null) {
                    factors[habitat] = 0;
                }
            }
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
    for (isotope of this.isotopes) {
        this.internalDoseRates[isotope] = {};
        var activity = this.activityConcentrations[isotope];
        var coef = this.internalCoefficients[isotope];
        for (organism of this.organisms) {
            this.internalDoseRates[isotope][organism] = activity[organism] * coef[organism];
        }
    }
};

// Calculate external dose rates from each media
Result.prototype.getExternal = function() {
    this.externalDoseRates = {};
    for (isotope of this.isotopes) {
        this.externalDoseRates[isotope] = {};
        var activity = this.activityConcentrations[isotope];
        var coef = this.externalCoefficients[isotope];
        for (organism of this.organisms) {
            this.externalDoseRates[isotope][organism] = [
                activity["Water"] * coef[organism],
                activity["Sediment"] * this.percentageDryWeight / 100 * coef[organism]
            ];
        }
    }

    // Calculate external dose rates for habitats
    this.habitatDoseRates = {};
    for (habitat in this.habitats) {
        var coef = this.habitats[habitat];
        var temp = {};
        for (isotope of this.isotopes) {
            temp[isotope] = {};
            for (organism of this.organisms) {
                var ext = this.externalDoseRates[isotope][organism];
                temp[isotope][organism] = ext[0] * coef[0] + ext[1] * coef[1];
            }
        }
        this.habitatDoseRates[habitat] = temp;
    }
};

// Calculate total dose rate using occupancy factors
Result.prototype.getTotal = function() {
    this.totalDoseRate = {};
    var habitats = Object.keys(this.habitats);
    for (isotope of this.isotopes) {
        this.totalDoseRate[isotope] = {};
        for (organism of this.organisms) {
            var occupancy = this.occupancyFactors[organism];
            var total = this.internalDoseRates[isotope][organism];
            for (habitat of habitats) {
                total += this.habitatDoseRates[habitat][isotope][organism] * occupancy[habitat];
            }
            this.totalDoseRate[isotope][organism] = total;
        }
    }
};

// Calculate dose rates
Result.prototype.calculate = function() {
    // Get missing data
    this.fillGaps();

    // Get summary coefficients
    this.getCoefficients();

    // Calculate internal and external dose rates
    this.getInternal();
    this.getExternal();
    this.getTotal();
};


// Create new setting
var setting = new Setting();


// Update list elements
var organismsList = document.getElementById("organisms");
organismsList.parentElement.addEventListener("click", function() {
    showInput("organisms");
});
var isotopesList = document.getElementById("isotopes");
isotopesList.parentElement.addEventListener("click", function() {
    showInput("isotopes");
});
var concentrationRatios = document.getElementById("c-ratios");
concentrationRatios.addEventListener("click", function() {
    showInput("CRs");
});
var distributionCoefficients = document.getElementById("k-ratios");
distributionCoefficients.addEventListener("click", function() {
    showInput("Kds");
});
var percentageDryWeight = document.getElementById("dry-weight");
percentageDryWeight.addEventListener("click", function() {
    showInput("dry");
});

var updateList = function(source, target) {
    target.innerHTML = "";
    for (item of source) {
        var itemEl = document.createElement("li");
        itemEl.textContent = item;
        target.appendChild(itemEl);
    }
};

// Show table for inputs
var showInput = function(type) {
    var appFrame = document.getElementsByClassName("app-frame")[0];
    var container = document.createElement("div");
    container.className = "input-box";
    appFrame.appendChild(container);

    var form = document.createElement("form");
    form.name = type;
    container.appendChild(form);

    var table = generateTable(type);
    form.appendChild(table);

    var confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = "OK";
    confirmButton.addEventListener("click", getInput);
    form.appendChild(confirmButton);

    var resetButton = document.createElement("input");
    resetButton.type = "reset";
    resetButton.value = "Reset";
    form.appendChild(resetButton);
};


// Write user input into setting
var getInput = function(event) {

    // Initial set up
    var form = event.target.closest("form");
    var inputs = form.querySelectorAll("table input");
    var setter;

    switch (form.name) {
        case "isotopes":
            setter = setting.setActivityConcentration.bind(setting);
            break;
        case "organisms":
            setter = setting.setOccupancyFactor.bind(setting);
            break;
        case "CRs":
            setter = setting.setConcentrationRatio.bind(setting);
            break;
        case "Kds":
            setter = setting.setDistributionCoefficient.bind(setting);
            break;
        case "dry":
            setter = setting.setPercentageDryWeight.bind(setting);
    }

    // Fill setting with values
    for (input of inputs) {
        var names = input.name.replace(/_/, " ").split(".");
        setter(names[0], names[1], parseFloat(input.value));
    }

    event.target.closest("div").remove();
};


var generateTable = function(type) {
    var table = document.createElement("table");
    var caption = document.createElement("caption");
    table.appendChild(caption);
    var rows;
    var cols;
    var getter;

    switch (type) {
        case "isotopes":
            caption.textContent = "Enter activity concentrations, Bq/kg";
            rows = setting.getIsotopes();
            cols = setting.media.concat(setting.getOrganisms());
            getter = setting.getActivityConcentration.bind(setting);
            break;
        case "organisms":
            caption.textContent = "Enter occupancy factors for organisms";
            rows = setting.getOrganisms();
            cols = Object.keys(setting.habitats);
            getter = setting.getOccupancyFactor.bind(setting);
            break;
        case "CRs":
            caption.textContent = "Enter concentration ratios";
            rows = setting.getNuclides();
            cols = setting.getOrganisms();
            getter = setting.getConcentrationRatio.bind(setting);
            break;
        case "Kds":
            caption.textContent = "Enter distribution coefficients";
            rows = setting.getNuclides();
            cols = ["Sediment to water activity concentration ratio"];
            getter = setting.getDistributionCoefficient.bind(setting);
            break;
        case "dry":
            caption.textContent = "Enter percentage dry weight for sediment";
            rows = ["%"];
            cols = ["Sediment to water activity concentration ratio"];
            getter = setting.getPercentageDryWeight.bind(setting);
            break;
    }

    // Generate header
    var tableHeader = document.createElement("thead");
    var headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("td"));
    for (col of cols) {
        var header = document.createElement("th");
        header.textContent = col;
        header.scope = "col";
        headerRow.appendChild(header);
    }
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    // Generate body
    var tableBody = document.createElement("tbody");
    for (row of rows) {
        var bodyRow = document.createElement("tr");
        var header = document.createElement("th");
        header.textContent = row;
        header.scope = "row";
        bodyRow.appendChild(header);
        for (col of cols) {
            var cell = document.createElement("td");
            var value = document.createElement("input");
            value.type = "number";
            value.name = (row + "." + col).replace(/ /g, "_");
            value.min = "0";
            if (type === "organisms") {
                // TODO: Don't allow input more than 1 in total
                value.max = "1";
            }
            // allow decimals
            value.step = "0.001";

            // Customization for dry weight
            if (type === "dry") {
                value.max = "100";
                value.step = "0.1";
            }

            if (getter(row)) {
                value.defaultValue = getter(row, col);
            }

            cell.appendChild(value);
            bodyRow.append(cell);
        }
        tableBody.appendChild(bodyRow);
    }
    table.appendChild(tableBody);

    return table;
};


// Add item selector right before target element (button)
// TODO: Replace selectors with checkbox lists
var addItemSelector = function(event, array) {

    // Parent container
    var newItemSelector = document.createElement("div");
    newItemSelector.className = "selector";  // for styling

    // Selector
    // TODO: Add labels for selectors
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
            updateList(setting.getIsotopes(), isotopes);
        }
        else {
            setting.addOrganism(value);
            updateList(setting.getOrganisms(), organisms);
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
