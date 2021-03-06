/*

App functions for interaction with user for HYDRA.

*/

// Update input boxes
var updateList = function(source, target) {
    target.innerHTML = "";
    for (item of source) {
        var itemEl = document.createElement("li");
        itemEl.textContent = item;
        target.appendChild(itemEl);
    }
};

// Show table for inputs
var showInput = function(appFrame, type, setting) {
    var container = document.createElement("div");
    appFrame.appendChild(container);

    var form = document.createElement("form");
    form.name = type;
    container.appendChild(form);

    var table = generateTable(type, setting);
    form.appendChild(table);

    var confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = "OK";
    confirmButton.addEventListener("click", function(event) {
        var form = event.target.closest("form");
        getInput(form, setting);
        event.target.closest("div").remove();
    });
    form.appendChild(confirmButton);

    var resetButton = document.createElement("input");
    resetButton.type = "reset";
    resetButton.value = "Reset";
    form.appendChild(resetButton);

    return container;
};


// Write user input into setting
var getInput = function(source, setting) {

    // Initial set up
    var inputs = source.querySelectorAll("table input");
    var setter;

    switch (source.name) {
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
        case "WFs":
            setter = setting.setRadiationWeightingFactor.bind(setting);
            break;
        case "dry":
            setter = setting.setPercentageDryWeight.bind(setting);
            break;
    }

    // Fill setting with values
    for (input of inputs) {
        var names = input.name.replace(/_/g, " ").split(".");
        setter(names[0], names[1], parseFloat(input.value));
    }
};


var generateTable = function(type, source) {
    var table = document.createElement("table");
    var caption = document.createElement("caption");
    table.appendChild(caption);
    var rows;
    var cols;
    var getter;

    switch (type) {
        case "isotopes":
            caption.textContent = "Enter activity concentrations, Bq/kg";
            rows = source.getIsotopes();
            cols = source.media.concat(source.getOrganisms());
            getter = source.getActivityConcentration.bind(source);
            break;
        case "organisms":
            caption.textContent = "Enter occupancy factors for organisms";
            rows = source.getOrganisms();
            cols = Object.keys(source.habitats);
            getter = source.getOccupancyFactor.bind(source);
            break;
        case "CRs":
            caption.textContent = "Enter concentration ratios";
            rows = source.getNuclides();
            cols = source.getOrganisms();
            getter = source.getConcentrationRatio.bind(source);
            break;
        case "Kds":
            caption.textContent = "Enter distribution coefficients";
            rows = source.getNuclides();
            cols = ["Sediment to water activity concentration ratio"];
            getter = source.getDistributionCoefficient.bind(source);
            break;
        case "WFs":
            caption.textContent = "Enter radiation weighting factors";
            rows = ["Alpha", "Beta/gamma", "Low Beta"];
            cols = ["Radiation weighting factors"];
            getter = source.getRadiationWeightingFactor.bind(source);
            break;
        case "dry":
            caption.textContent = "Enter percentage dry weight for sediment";
            rows = ["%"];
            cols = ["Sediment to water activity concentration ratio"];
            getter = source.getPercentageDryWeight.bind(source);
            break;
        case "output":
            caption.textContent = "Total dose rates, \u03bcGy h\u207b\u00b9";
            rows = source.getIsotopes();
            cols = source.getOrganisms();
            getter = source.getTotalDoseRate.bind(source);
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
            if (type === "output") {
                var value = getter(row, col);
                cell.textContent = value ? value.toExponential(2) : "No data";
            }
            else {
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
            }
            bodyRow.append(cell);
        }
        tableBody.appendChild(bodyRow);
    }

    table.appendChild(tableBody);

    if (type === "output") {
        var footer = document.createElement("tfoot");
        var totalRow = document.createElement("tr");
        var header = document.createElement("th");
        header.textContent = "Total";
        header.scope = "row";
        totalRow.appendChild(header);
        for (col of cols) {
            var cell = document.createElement("td");
            var value = source.getOrganismTotalDoseRate(col);
            cell.textContent = value ? value.toExponential(2) : "No data";
            totalRow.append(cell);
        }
        footer.appendChild(totalRow);
        table.appendChild(footer);
    }

    return table;
};


// Add item selector right before target element (button)
var addCheckbox = function(target, type, setting, list) {

    var array;
    var setter;
    var getter;
    var remover;

    switch (type) {
        case "isotopes":
            array = erica.isotopes;
            setter = setting.addIsotope.bind(setting);
            getter = setting.getIsotopes.bind(setting);
            remover = setting.deleteIsotope.bind(setting);
            break;
        case "organisms":
            array = erica.organisms;
            setter = setting.addOrganism.bind(setting);
            getter = setting.getOrganisms.bind(setting);
            remover = setting.deleteOrganism.bind(setting);
            break;
    }

    for (item of array) {
        var label = document.createElement("label");
        label.className = "control-item";
        label.textContent = item;
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        checkbox.addEventListener("change", function(e) {
            var value = e.target.parentNode.textContent;
            if (e.target.checked) {
                setter(value);
            }
            else {
                remover(value);
            }
            updateList(getter(), list);
            e.target.parentNode.classList.toggle("selected-item");
        })

        label.appendChild(checkbox);
        target.appendChild(label);
    }
};
