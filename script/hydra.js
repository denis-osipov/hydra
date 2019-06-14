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
            activeOrganism = null;
            inputImage.style.cursor = "";
        }
    }.bind(this));
};

var Nuclide = function(element, isotope) {
    this.element = element;
    this.isotope = isotope;
};


// Add item selector right before target element (button)
var addItem = function(event, itemType) {

    switch (itemType) {
        case "organism":
            var array = organismNames;
            var itemConstructor = Organism;
            var itemList = organismList;
            break;
        case "nuclide":
            var array = isotopes;
            var itemConstructor = Nuclide;
            var itemList = isotopeList;
    }

    // Parent container
    var newItem = document.createElement("div");
    newItem.className = "selector";  // for styling

    // Selector
    var selector = document.createElement("select");
    for (var i = 0; i < array.length; i++) {
        var option = document.createElement("option");
        option.textContent = array[i];
        selector.appendChild(option);
    }
    newItem.appendChild(selector);

    // Item button
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "^";
    newItem.appendChild(button);

    var target = event.target;
    
    target.parentNode.insertBefore(newItem, target);

    itemList.push(new itemConstructor(selector, button));
};


// ERICA's data
var organismNames = ["Phytoplankton", "Zooplankton"];
var isotopes = ["Cs-137", "Sr-90"];


// App elements
var inputImage = document.getElementById("pond");


// User input
var organismList = [];
var isotopeList = [];
var activeOrganism;


// Organisms fieldset
var addOrganismButton = document.getElementById("add-organism");
addOrganismButton.addEventListener("click", function(e){addItem(e, "organism")});


// Isotopes fieldset
var addIsotopeButton = document.getElementById("add-isotope");
addIsotopeButton.addEventListener("click", function(e){addItem(e, "nuclide")});


// Habitats
var habitats = [];
var locations = document.getElementsByClassName("location");
for (var i = 0; i < locations.length; i++) {
    habitats.push(new Habitat(locations[i]));
}
