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

    // Fix name and let add organism to some habitat
    this.setName = function() {
        this.name = this.selector.value;
        this.selector.disabled = true;
        this.button.removeEventListener("click", setNameBind);
        this.button.addEventListener("click", function(){
            activeOrganism = this;
            inputImage.style.cursor = "cell";
        }.bind(this));
    };

    var setNameBind = this.setName.bind(this);
    this.button.addEventListener("click", setNameBind);
};

var Media = function(name) {
    this.name = name;
    this.nuclides = [];
};

var Habitat = function(region) {
    this.region = region;
    this.residents = [];
    this.region.addEventListener("click", function(){
        if (activeOrganism) {
            this.residents.push(activeOrganism);
            activeOrganism.locations.push(this);
            activeOrganism = null;
            inputImage.style.cursor = "";
        }
    }.bind(this));
};

var Nuclide = function(element, isotope) {
    this.element = element;
    this.isotope = isotope;
};


// ERICA's data
var organismNames = ["Phytoplankton", "Zooplankton"];


// App elements
var inputImage = document.getElementById("pond");


// User input
var organismList = [];
var activeOrganism;


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


// Habitats
var habitats = [];
var locations = document.getElementsByClassName("location");
for (var i = 0; i < locations.length; i++) {
    habitats.push(new Habitat(locations[i]));
}
