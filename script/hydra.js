/*

Script for dose rate calculation.

Uses ERICA Assessment Tool's assets.
ERICA version 1.3.1.33

*/


// Global active item
var activeItem;


// Create constructors

var Habitat = function(media) {
    this.media = media;
    this.inhabitants = [];
};

var Medium = function(name) {
    this.name = name;
    this.nuclides = {};
}

var Organism = function(name) {
    this.name = name;
    this.nuclides = {};
}

var Isotope = function(name) {
    this.name = name;
}

// Add item selector right before target element (button)
var addItemSelector = function(event, type) {

    switch (type) {
        case "organism":
            var array = organismNames;
            var constructor = Organism;
            break;
        case "isotope":
            var array = isotopes;
            var constructor = Isotope;
            break;
    }

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
        var itemName = e.target.previousSibling.value;
        activeItem = new constructor(itemName);
        document.getElementById("input").style.cursor = "cell";
    });
    newItemSelector.appendChild(button);

    var target = event.target;
    target.parentNode.insertBefore(newItemSelector, target);
};

// organisms fieldset
var addOrganismButton = document.getElementById("add-organism");
addOrganismButton.addEventListener("click", function(e){
    addItemSelector(e, "organism")
});

// isotopes fieldset
var addIsotopeButton = document.getElementById("add-isotope");
addIsotopeButton.addEventListener("click", function(e){
    addItemSelector(e, "isotope")
});


// Media
var waterMedium = Medium("water");
var sedimentMedium = Medium("sediment");

// Habitats
var waterSurface = new Habitat({water: 0.5});
var water = new Habitat({water: 1.0});
var sedimentSurface = new Habitat({water: 0.5, sediment: 0.5});
var sediment = new Habitat({sediment: 0.5});

var habitats = [waterSurface, water, sedimentSurface, sediment];