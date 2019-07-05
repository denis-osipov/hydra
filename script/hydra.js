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

// Isotopes adder
Setting.prototype.addIsotope = function(isotope) {
    this.isotopes.add(isotope);
};

// Get isotopes as array
Setting.prototype.getIsotopes = function() {
    return Array.from(this.isotopes);
};

// Delete isotope
Setting.prototype.deleteIsotope = function(isotope, all=false) {
    this.isotopes.delete(isotope);
    if (all) {
        delete this.activityConcentrations[isotope];
        delete this.concentrationRatios[isotope];
        delete this.distributionCoefficients[isotope];
        delete this.doseConversionCoefficients[isotope];
    }
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

// Delete organism
Setting.prototype.deleteOrganism = function(organism, all=false) {
    this.organisms.delete(organism);
    if (all) {
        delete this.occupancyFactors[organism];
        for (isotope of this.isotopes) {
            if (this.activityConcentrations[isotope]) {
                delete this.activityConcentrations[isotope][organism];
            }
            if (this.concentrationRatios[isotope]) {
                delete this.activityConcentrations[isotope][organism];
            }
            if (this.doseConversionCoefficients[isotope]) {
                delete this.doseConversionCoefficients[isotope][organism];
            }
        }
    }
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
type must "Appha", "Beta/gamma" or "Low Beta".
*/
Setting.prototype.setRadiationWeightingFactor = function(type, text, value) {
    var index = {"Alpha": 0, "Beta/gamma": 1, "Low Beta": 2};
    this.radiationWeightingFactors[index[type]] = value;
};

Setting.prototype.getRadiationWeightingFactor = function(type, text) {
    var index = {"Alpha": 0, "Beta/gamma": 1, "Low Beta": 2};
    return this.radiationWeightingFactors[index[type]];
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

// Get isotopes and organisms list
Result.prototype.getIsotopes = function() {
    return this.isotopes;
};

Result.prototype.getOrganisms = function() {
    return this.organisms;
};

// Fill missing data using ERICA's coefficients
Result.prototype.fillGaps = function(setting) {
    var toRemove = [];
    for (isotope of this.isotopes) {

        // Stop if there is no data about some isotope
        if (!this.activityConcentrations[isotope] ||
            Object.values(this.activityConcentrations[isotope]).every(function(value) {
                return isNaN(value) || value === null;
            })) {
            console.log(`Can't find any data for ${isotope}`);
            toRemove.unshift(this.isotopes.indexOf(isotope));
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

    // Remove isotopes with no data
    for (index of toRemove) {
        this.isotopes.splice(index, 1);
    }

    // Clear organism list if there is no any data for activity concentration
    if (!this.isotopes.length) {
        this.organisms.splice();
    }

    // Fill occupancy factors
    for (organism of this.organisms) {
        var factors = this.occupancyFactors[organism];
        if (!factors || Object.values(factors).every(function(value) {
            return isNaN(value) || value === null;
        })) {
            this.occupancyFactors[organism] = erica.occ[organism];
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
    this.totalDoseRates = {};
    var habitats = Object.keys(this.habitats);
    for (isotope of this.isotopes) {
        this.totalDoseRates[isotope] = {};
        for (organism of this.organisms) {
            var occupancy = this.occupancyFactors[organism];
            var total = this.internalDoseRates[isotope][organism];
            for (habitat of habitats) {
                total += this.habitatDoseRates[habitat][isotope][organism] * occupancy[habitat];
            }
            this.totalDoseRates[isotope][organism] = total;
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

Result.prototype.getTotalDoseRate = function(isotope, organism) {
    if (!this.totalDoseRates[isotope]) {
        return undefined;
    }
    return this.totalDoseRates[isotope][organism];
};
