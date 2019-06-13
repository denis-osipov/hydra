/*

Script for dose rate calculation.

Uses ERICA Assessment tool's assets.
ERICA version 1.3.1.33

*/


// Create constructors

var Organism = function(name) {
    this.name = name;
    this.locations = [];
    this.doseRate = null;
};

var Media = function(name) {
    this.name = name;
    this.nuclides = [];
};

var Habitat = function(name) {
    this.name = name;
};

var Nuclide = function(element, isotope) {
    this.element = element;
    this.isotope = isotope;
};


// Organisms fieldset

var addOrganismButton = document.getElementById("add-organism");

var addOrganism = function() {
    var newOrganism = document.createElement("select");
    addOrganismButton.parentNode.insertBefore(newOrganism, addOrganismButton);
};

addOrganismButton.addEventListener("click", addOrganism);
