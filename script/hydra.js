/*

Script for dose rate calculation.

Uses ERICA Assessment Tool's assets.
ERICA version 1.3.1.33

*/


// Create constructors

var Habitat = function() {
    this.media = [];
    this.inhabitants = [];
};

var Medium = function(name) {
    this.name = name;
    this.nuclides = [];
}

var Organism = function(name) {
    this.name = name;
    this.nuclides = [];
}

var Isotope = function(name) {
    this.name = name;
}

// Add item selector right before target element (button)
var addItemSelector = function(event, type) {

    switch (type) {
        case "organism":
            var array = organismNames;
            var itemConstructor = Organism;
            break;
        case "isotope":
            var array = isotopes;
            var itemConstructor = Isotope;
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
