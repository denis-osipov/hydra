/*

Script for dose rate calculation.

Uses ERICA Assessment tool's assets.
ERICA version 1.3.1.33

*/


// Create constructors

var Organism = function(selector, button) {
    this.selector = selector;
    this.button = button;
    this.locations = [];
    this.doseRate = null;

    this.setName = function() {
        console.log("Setting name");
        this.name = this.selector.value;
        this.selector.disabled = true;
        this.button.disabled = true;
    };

    this.button.addEventListener("click", this.setName.bind(this));
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


// User input
var organismList = [];


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

    organismList.push(new Organism(selector, button));
};

addOrganismButton.addEventListener("click", addOrganism);
