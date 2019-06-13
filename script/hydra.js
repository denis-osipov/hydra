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


// ERICA's data
var organismNames = ["Phytoplankton", "Zooplankton"];


// Organisms fieldset

var addOrganismButton = document.getElementById("add-organism");

// Add organism selector right before "add" button
var addOrganism = function() {

    // Parent container
    var newOrganism = document.createElement("div");
    newOrganism.className = "organism";  // for styling

    // Selector
    var selector = document.createElement("select");
    for (var i = 0; i < organismNames.length; i++) {
        var option = document.createElement("option");
        option.textContent = organismNames[i];
        selector.appendChild(option);
    }
    newOrganism.appendChild(selector);

    // Organism button
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "^";
    newOrganism.appendChild(button);
    
    addOrganismButton.parentNode.insertBefore(newOrganism, addOrganismButton);
};

addOrganismButton.addEventListener("click", addOrganism);
