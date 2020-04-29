//declare map var in global scope
var map;
var dataStats = {min:50, max:7000, mean:1000}; //manually created values for the total combined numbers

//Declare Database global variables
var currentDB; //current json on map
var currentDBFiltered; //current filtered database if ther is one
var dataSelected = ["combined-database", "state-scale"]
//Declare Filter option global variables
var dataFiltered = false;
var gender = ["Female", "Male"];
var ageFrom = 0;
var ageTo = 120;
var ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
var yearStart = 1900;
var yearEnd = 2020;
var Month = [1,2,3,4,5,6,7,8,9,10,11,12]
//Retrieve Varaibles
var unitSelected;


///// Functions for Map /////
//Function to instantiate the Leaflet map
function createMap(){
    //create the map
    myBounds = new L.LatLngBounds(new L.LatLng(60, 0), new L.LatLng(30, 0));
    map = L.map('map', {
        zoomControl: false,
        center: [38, -93],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        maxBounds: [[75, -180], [-30, 180]], // [top, left], [bottom, right]
    });

    // Add zoom control (but in top right)
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add zoom buttons for non-contiguous states and territories
    L.easyButton('<strong>AK</strong>', function(){
        map.setView([65.144912, -152.541399], 3.5);
    },'zoom to Alaska',{ position: 'topright' }).addTo(map);

    L.easyButton('<strong>HI</strong>', function(){
        map.setView([20.891499, -157.959362], 6.29);
    },'zoom to Hawaii',{ position: 'topright' }).addTo(map);

    L.easyButton('<strong>GU</strong>', function(){
        map.setView([13.432056, 144.812821], 10.5);
    },'zoom to Guam',{ position: 'topright' }).addTo(map);

    L.easyButton('<strong>MP</strong>', function(){
        //map.setView([16.530659, 146.027901], 6.35); alternative view of all islands
        map.setView([15.097820, 145.642088], 10.5);
    },'zoom to North Mariana Islands',{ position: 'topright' }).addTo(map);

    L.easyButton('<strong>PR</strong>', function(){
        map.setView([18.254990, -66.423918], 9.25);
    },'zoom to Puerto Rico',{ position: 'topright' }).addTo(map);

    L.easyButton('<strong>VI</strong>', function(){
        map.setView([17.970324, -64.727032], 10);
    },'zoom to U.S. Virgin Islands',{ position: 'topright' }).addTo(map);

    //Add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
	     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	     subdomains: 'abcd'
    }).addTo(map);

    // Get data differently depending on if it is filtered or not
    if (dataFiltered){
        getDataFiltered(map);
    } else {
        getData(map);
    }
};

//Import GeoJSON data
function getData(map){
    // Depending on what info is clicked, select the correct data
    if (dataSelected[0] === "combined-database" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/summary_counts.json", function(response){
            //create an attributes array
            var attributes = processData(response, "combined"); // attributes = Total Number

            // calcStats(response, "combined");
            createPropSymbols(response, attributes, "combined");
            createLegend(attributes[0], "combined");
        });
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response, "missing");
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response, "unidentified");
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response, "unclaimed");
            createPropSymbols(response, attributes, "unclaimed");
            createLegend(attributes[0], "unclaimed");
        });
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "county-scale") {
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response, "missing");
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "county-scale") {
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response, "unidentified");
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "county-scale") {
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response, "unclaimed");
            createPropSymbols(response, attributes, "unclaimed");
            createLegend(attributes[0], "unclaimed");
        });
    }


};

//Get Data for filtered
function getDataFiltered(map){
    //load the data
        //create an attributes array
        var attributes = processData(currentDB, "filtered");

        // calcStats(currentDB, "filtered");
        createPropSymbols(currentDB, attributes, "filtered");
        createLegend(currentDB[0], "filtered");
}

//Build an attributes array from the special data
function processData(data, keyword){
    //empty array to hold attributes
    var attributes = [];
    //empty variable to store properties
    var currentProperties;

    //properties of the first feature in the dataset
    if (keyword === "combined") {
        //assign current json to global variable for filtering
        currentDB = data;

        //properties of the first feature in the dataset
        currentProperties = data.features[0].properties;

        //push each attribute name into attributes array
        for (var attribute in currentProperties){
            //only take attributes with keyword values
            if (attribute.indexOf("Total_Count") > -1){
                attributes.push(attribute);
            };
        };
    } else if (keyword === "missing") {
        //assign current json to global variable for filtering
        currentDB = data;

        currentProperties = data.features[0].properties.missing;

        //push each attribute into attributes array
        for (var attribute in currentProperties){
            attributes.push(attribute);
        };
    } else if (keyword === "unclaimed") {
        //assign current json to global variable for filtering
        currentDB = data;

        currentProperties = data.features[0].properties.unclaimed;

        //push each attribute into attributes array
        for (var attribute in currentProperties){
            attributes.push(attribute);
        };
    } else if (keyword === "unidentified") {
        //assign current json to global variable for filtering
        currentDB = data;

        currentProperties = data.features[0].properties.unidentified;

        //push each attribute into attributes array
        for (var attribute in currentProperties){
            attributes.push(attribute);
        };
    } else if (keyword === "filtered") {

        currentProperties = data.features[0].properties.filtered;

        //push each attribute into attributes array
        for (var attribute in currentProperties){
            attributes.push(attribute);
        };
    }

    return attributes;
};

// Add circle markers for point features to the map
function createPropSymbols(data, attributes, keyword){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes, keyword);
        }
    }).addTo(map);
};

//Convert markers to circle markers
function pointToLayer(feature, latlng, attributes, keyword){
    // Determine which attribute to visualize with proportional symbols
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];

    if (keyword == "combined"){
        //create marker options
        var options = {
            fillColor: "#78BFA5",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties[attribute]);
        //Create the popup content for the combined dataset layer
        var popupContent = createPopupContent(feature.properties, attribute);
    } else if (keyword == "missing"){
        //create marker options
        var options = {
            fillColor: "#66A3D9",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties.missing.length);

        var popupContent = createPopupContentExtra(feature, attValue, keyword);
    } else if (keyword == "unidentified"){
        //create marker options
        var options = {
            fillColor: "#F2B872",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties.unidentified.length);

        var popupContent = createPopupContentExtra(feature, attValue, keyword);
    } else if (keyword == "unclaimed"){
        //create marker options
        var options = {
            fillColor: "#D96A6A",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties.unclaimed.length);

        var popupContent = createPopupContentExtra(feature, attValue, keyword);
    } else if (keyword == "filtered"){
        //create marker options
        if (dataSelected[0] === "missing-persons") {
            var options = {
                fillColor: "#66A3D9",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        } else if (dataSelected[0] === "unidentified-persons") {
            var options = {
                fillColor: "#F2B872",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        } else if (dataSelected[0] === "unclaimed-persons") {
            var options = {
                fillColor: "#D96A6A",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        }

        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties.filtered.length);

        var popupContent = createPopupContentExtra(feature, attValue, keyword);
    }

    //Give each feature's circle marker a radius based on its attribute value
    if (attValue > 0) {
        options.radius = calcPropRadius(attValue, keyword);
    } else  if (attValue == 0) {
        var options = {
            radius: 0,
            fillColor: "#ffffff",
            color: "#000",
            weight: 1,
            opacity: 0,
            fillOpacity: 0,
            // display: none
        };
        // options.radius = calcPropRadius(attValue, keyword);
    }

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,(-options.radius)/2)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Creates text for the popups in the prop symbols
function createPopupContentExtra(feature, attValue, keyword){
    //add name to popup content string
    var popupContent = "<p style='font-size: 20px'><b>" + feature.name + "</b></p>";

    //add formatted attribute to panel content string
    if (keyword === "missing") {
        popupContent += "<p>Number of Missing Persons Records: <b>" +attValue + "</b></p>";

        popupContent += '<a class="retrieveNames" href="#">Click here to Retrieve List of Records</a>';
    } else if (keyword === "unidentified") {
        popupContent += "<p>Number of Unidentified Persons Records: <b>" +attValue + "</b></p>";

        popupContent += '<a class="retrieveNames" href="#">Click here to Retrieve List of Records</a>';
    } else if (keyword === "unclaimed") {
        popupContent += "<p>Number of Unclaimed Persons Records: <b>" +attValue + "</b></p>";

        popupContent += '<a class="retrieveNames" href="#">Click here to Retrieve List of Records</a>';
    } else if (keyword === "filtered") {
        popupContent += "<p>Number of Filtered Persons Records: <b>" +attValue + "</b></p>";

        popupContent += '<a class="retrieveNames" href="#">Click here to Retrieve List of Records</a>';
    }

    return popupContent;
};

// Creates text for the popups in the prop symbols
function createPopupContent(properties, attribute){
    //add name to popup content string
    var popupContent = "<p style='font-size: 20px'><b>" + properties.NAME + "</b></p>";
    //get combined record number
    var combined = properties[attribute];
    //get missing persons record number
    var missing;
    if (properties.Missing_Count == null){
        missing = 0;
    } else {
        missing = properties.Missing_Count;
    }
    //get unidentified persons record number
    var unidentified;
    if (properties.Unidentified_Count == null){
        unidentified = 0;
    } else {
        unidentified = properties.Unidentified_Count;
    }
    //get unclaimed persons record number
    var unclaimed;
    if (properties.Unclaimed_Count == null){
        unclaimed = 0;
    } else {
        unclaimed = properties.Unclaimed_Count;
    }

    //add formatted attribute to panel content string
    popupContent += "<p><b>Number of Combined Dataset Records: " + combined + "</b></p>";
    popupContent += "<p>Number of Missing Persons Records: <b>" + missing + "</b></p>";
    popupContent += "<p>Number of Unidentified Persons Records: <b>" + unidentified + "</b></p>";
    popupContent += "<p>Number of Unclaimed Persons Records: <b>" + unclaimed + "</b></p>";

    return popupContent;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue, keyword) {
    if (dataSelected[1] === "state-scale") {
        if (keyword === "combined"){
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1;
        } else if (keyword === "missing") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else if (keyword === "unidentified") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.7;
        } else if (keyword === "unclaimed") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.6;
        } else {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        }
    } else if (dataSelected[1] === "county-scale") {
        if (keyword === "combined"){
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.8;
        } else if (keyword === "missing") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1;
        } else if (keyword === "unidentified") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1;
        } else if (keyword === "unclaimed") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1;
        } else {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1;
        }
    }

    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

    return radius;
};

//Calculate the max, mean, min values of the dataset. /// Currently not being used as these values are hardcoded. ///
function calcStats(data, keyword){
    //create empty array to store all data values
    var allValues = [];

    if(keyword === "combined"){
        //loop through each unit
        for(var unit of data.features){
            //get number of records
            var value = unit.properties.Total_Count;
            //add value to array
            allValues.push(value);
        }
    } else if (keyword === "missing"){
        //Loop through each enumeration area
        for (eachArea in data.features){
            //Loop through each record
            for (eachRecord in data.features[eachArea].properties.missing){
                //get number of records
                var value = data.features[eachArea].properties.missing.length;
                //add value to array
                allValues.push(value);
            }
        }
    } else if (keyword === "unidentified"){
        //Loop through each enumeration area
        for (eachArea in data.features){
            //Loop through each record
            for (eachRecord in data.features[eachArea].properties.unidentified){
                //get number of records
                var value = data.features[eachArea].properties.unidentified.length;
                //add value to array
                allValues.push(value);
            }
        }
    } else if (keyword === "unclaimed"){
        //Loop through each enumeration area
        for (eachArea in data.features){
            //Loop through each record
            for (eachRecord in data.features[eachArea].properties.unclaimed){
                //get number of records
                var value = data.features[eachArea].properties.unclaimed.length;
                //add value to array
                allValues.push(value);
            }
        }
    } else if (keyword === "filtered"){
        //Loop through each enumeration area
        for (eachArea in data.features){
            //Loop through each record
            for (eachRecord in data.features[eachArea].properties.filtered){
                //get number of records
                var value = data.features[eachArea].properties.unidentified.filtered;
                //add value to array
                allValues.push(value);
            }
        }
    }

    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues)
    dataStats.max = Math.max(...allValues);

    //calculate mean
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
}

//Create the legend of proportional symbols set to the defined max, min, mean in the "dataStats" global varaible
function createLegend(attribute, keyword){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            if (keyword === "combined"){
                dataStats = {min:50, max:7000, mean:1000};
                $(container).append('<h3 id="legend-title" ><b>Combined Database</b></h3>');
                $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                //Start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                //array of circle names to base loop on
                var circles = ["max", "mean", "min"];

                //Loop to add each circle and text to svg string
                for (var i=0; i<circles.length; i++){
                    //Assign the r and cy attributes
                    var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#78BFA5" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";


            } else if (keyword === "missing"){
                if (dataSelected[1] === "state-scale") {
                    dataStats = {min:50, max:2500, mean:1000}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "county-scale"){
                    dataStats = {min:10, max:600, mean:200}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="100px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -90;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 30 + 30; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                }
            } else if (keyword === "unidentified"){
                if (dataSelected[1] === "state-scale") {
                    dataStats = {min:10, max:2700, mean:1000}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Unidentified Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "county-scale"){
                    dataStats = {min:5, max:1000, mean:300}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Unidentified Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                    }
            } else if (keyword === "unclaimed"){
                if (dataSelected[1] === "state-scale") {
                    dataStats = {min:10, max:3000, mean:1500}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Unclaimed Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "county-scale"){
                    dataStats = {min:5, max:1000, mean:500}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Unclaimed Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                    }
            } else if (keyword === "filtered"){
                if (dataSelected[0] === "missing-persons"){
                    if (dataSelected[1] === "state-scale") {
                        dataStats = {min:50, max:2500, mean:1000}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "county-scale"){
                        dataStats = {min:10, max:600, mean:200}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="100px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -90;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 30 + 30; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                    }
                } else if (dataSelected[0] === "unidentified-persons"){
                    if (dataSelected[1] === "state-scale") {
                        dataStats = {min:10, max:2700, mean:1000}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Unidentified Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "county-scale"){
                        dataStats = {min:5, max:1000, mean:300}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Unidentified Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                        }
                } else if (dataSelected[0] === "unclaimed-persons"){
                    if (dataSelected[1] === "state-scale") {
                        dataStats = {min:10, max:3000, mean:1500}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Unclaimed Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "county-scale"){
                        dataStats = {min:5, max:1000, mean:500}; //manually created values for the total combined numbers
    
                        $(container).append('<h3 id="legend-title" ><b>Unclaimed Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');
    
                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';
    
                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];
    
                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;
    
                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="0.8" stroke="#000000" cx="88"/>';
    
                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value
    
                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };
    
                        //close svg string
                        svg += "</svg>";
                    }
                }
            }

            //add attribute legend svg to container
            $(container).append(svg);

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new LegendControl());
};


/////  Filter Functions  /////
// Retrieve which database is selected and update advance filter labels and map
function getDatabase(){
    dataSelected[0] = document.querySelector('.database-check:checked').value;
    var container = L.DomUtil.get('map');

    if (dataSelected[0] === "missing-persons") {
        $('.data-header').html("Data: Missing Persons");
        $('#date-gone-found').html("Date Last Seen");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', true);
        $("#gender-unsure").attr('disabled', true);
        dataFiltered = false;
        resetFilterOptions();

    } else if (dataSelected[0] === "unidentified-persons") {
        $('.data-header').html("Data: Unidentified Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', false);
        $("#gender-unsure").attr('disabled', false);
        dataFiltered = false;
        resetFilterOptions();

    } else if (dataSelected[0] === "unclaimed-persons") {
        $('.data-header').html("Data: Unclaimed Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', true);
        $("#gender-unsure").attr('disabled', true);
        dataFiltered = false;
        resetFilterOptions();

    } else if (dataSelected[0] === "combined-database") {
        $('.data-header').html("Data: Combined Database");
        $('#collapseTwo').collapse('hide');
        $('#collapseThree').collapse('hide');
        $('#date-gone-found').html("...");
        $('#adv-filt').attr('data-toggle', "");
        dataFiltered = false;
        resetFilterOptions();
    }
}

// Retrieve which map scale is selected and update map
function getMapScale(){
    dataSelected[1] = document.querySelector('.mapScale-check:checked').value;

    if (dataSelected[1] === "state-scale") {
        $('.mapScale-header').html("Map Scale: State");
        dataFiltered = false;

        resetMap();
        createMap();
    } else if (dataSelected[1]=== "county-scale") {
        $('.mapScale-header').html("Map Scale: County");
        dataFiltered = false;

        resetMap();
        createMap();
    } else if (dataSelected[1] === "city-scale") {
        $('.mapScale-header').html("Map Scale: City");
        dataFiltered = false;

        resetMap();
        createMap();
    }
}

// Function to Select All/Deselect All Ethnicity Boxes
function checkAllEthnicity(){
    // Check or Uncheck All checkboxes
    $("#ethnicity-all").change(function(){
        var checked = $(this).is(':checked');
        if(checked){
          $(".ethnicity-check").each(function(){
            $(this).prop("checked",true);
          });
        }else{
          $(".ethnicity-check").each(function(){
            $(this).prop("checked",false);
          });
        }
      });

     // Changing state of CheckAll checkbox
     $(".ethnicity-check").click(function(){

       if($(".ethnicity-check").length == $(".ethnicity-check:checked").length) {
         $("#ethnicity-all").prop("checked", true);
       } else {
         $("#ethnicity-all").removeAttr("checked");
       }

     });
}

// Function to Select All/Deselect All Month Boxes
function checkAllMonths(){
    // Check or Uncheck All checkboxes
    $("#month-all").change(function(){
        var checked = $(this).is(':checked');
        if(checked){
          $(".month-check").each(function(){
            $(this).prop("checked",true);
          });
        }else{
          $(".month-check").each(function(){
            $(this).prop("checked",false);
          });
        }
      });

     // Changing state of CheckAll checkbox
     $(".month-check").click(function(){

       if($(".month-check").length == $(".month-check:checked").length) {
         $("#month-all").prop("checked", true);
       } else {
         $("#month-all").removeAttr("checked");
       }

     });
}

// Get the gender that was checked
function getCheckedGender() {
    var genderSelected = document.querySelector('.gender-check:checked').value; //$('.gender-check:checked').val())
    if (genderSelected === "All") {
        var output = ["Female", "Male", "Other", "Unsure"]
    } else if (genderSelected === "Female") {
        var output = ["Female"]
    } else if (genderSelected === "Male") {
        var output = ["Male"]
    } else if (genderSelected === "Other") {
        var output = ["Other"]
    } else if (genderSelected === "Unsure") {
        var output = ["Unsure"]
    }
    return output;
}

// Get the list of ethnicity checkboxes checked
function getCheckedEthnicity() {
    var checkboxes = document.getElementsByName('ethnicity-check');
    var checkboxesChecked = [];
    // loop over them all
    for (var i=0; i<checkboxes.length; i++) {
       // And stick the checked ones onto an array...
       if (checkboxes[i].checked) {
          checkboxesChecked.push(checkboxes[i].value);
       }
    }
    // Return the array if it is non-empty, or default to all
    return checkboxesChecked.length > 0 ? checkboxesChecked : ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
}

// Get the list of month checkboxes checked
function getCheckedMonth() {
    var checkboxes = document.getElementsByName('month-check');
    var checkboxesChecked = [];
    // loop over them all
    for (var i=0; i<checkboxes.length; i++) {
       // And stick the checked ones onto an array...
       if (checkboxes[i].checked) {
          checkboxesChecked.push(Number(checkboxes[i].value));
       }
    }
    // Return the array if it is non-empty, or default to all
    return checkboxesChecked.length > 0 ? checkboxesChecked : [1,2,3,4,5,6,7,8,9,10,11,12];
}

//Reset the Advanced Filter Options to Default
function resetFilterOptions() {
    $("#advanced-filter").trigger("reset");
    
    dataFiltered = false;
    gender = ["Female", "Male"];
    ageFrom = 0;
    ageTo = 120;
    ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
    yearStart = 1900;
    yearEnd = 2020;
    Month = [1,2,3,4,5,6,7,8,9,10,11,12]

    resetMap();
}

//Clear the map and recreate it
function resetMap(){
    var container = L.DomUtil.get('map');
    map.remove();
        if(container != null){
            container._leaflet_id = null;
    }
    createMap();
}

// Retrieve which advanced filter options are selected
function getFilterOptions(){
    //Check to make sure ageFrom is not older than ageTo and yearStart is not later than yearEnd
    //If it passes those checks, than accept the form
    if (Number($('#ageFrom-check').val()) > Number($('#ageTo-check').val())){
        alert("Submission not accepted. Age From is later than Age To.");
    } else if (Number($('#yearStart-check').val()) > Number($('#yearEnd-check').val())) {
        alert("Submission not accepted. Year Start is later than Year End.");
    } else {
        dataFiltered = true;
        gender = getCheckedGender();
        ageFrom = Number(document.querySelector('#ageFrom-check').value); //$('#ageFrom-check').val())
        ageTo = Number(document.querySelector('#ageTo-check').value);
        ethnicity = getCheckedEthnicity();
        yearStart = Number(document.querySelector('#yearStart-check').value);
        yearEnd = Number(document.querySelector('#yearEnd-check').value);
        month = getCheckedMonth();

        doAdvanceFilter();
    }
}

// Function to filter the data per the selected options
function doAdvanceFilter() {
    // shortand for the filtering below
    data = currentDB.features;

    // Make sure filter is empty before applying new filter
    for (eachArea in currentDB.features){
        currentDB.features[eachArea].properties.filtered = [];
    }

    var count =0;
    //Loop through all of the records comparing the filtered options to the record
    if (dataSelected[0]=== "missing-persons") {
        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.missing){
                var currentVar = data[eachArea].properties.missing[eachRecord];

                //Compare gender first
                for (eachGender in gender){
                    if(currentVar["Sex"] === gender[eachGender]){
                        //Compare age
                        if(Number(currentVar["Missing Age"]) >= Number(ageFrom) && Number(currentVar["Missing Age"]) <= Number(ageTo)){
                            //Compare Year
                            if(currentVar["DLC"].slice(-4) >= yearStart && currentVar["DLC"].slice(-4) <= yearEnd){
                                //Compare Month
                                for (eachMonth in month){
                                    if(currentVar["DLC"].substr(0, currentVar["DLC"].indexOf('/')) == month[eachMonth]){
                                        //Compare ethnicity
                                        for(eachEthnicity in ethnicity) {
                                            if(currentVar["Race / Ethnicity"].includes(ethnicity[eachEthnicity])){

                                                //Only add records to new filtered list if it has not been added already, accounts for data issues in ethnicity
                                                //First add the first record to the filtered so there a value to compare to if the records is already added
                                                if(data[eachArea].properties.filtered.length < 1){
                                                    currentDB.features[eachArea].properties.filtered.push(currentVar);

                                                } else {
                                                    // Then if the case is not already in the array, add it
                                                    if (!(currentVar["Case Number"] in data[eachArea].properties.filtered)){
                                                        currentDB.features[eachArea].properties.filtered.push(currentVar);
                                                    }
                                                }
                                                // Break to stop comparing when record person has multiple ethnicities
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if (dataSelected[0] === "unclaimed-persons") {
        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.unclaimed){
                var currentVar = data[eachArea].properties.unclaimed[eachRecord];

                //Compare gender first
                for (eachGender in gender){
                    if(currentVar["Sex"] === gender[eachGender]){
                        //Compare Year
                        if(currentVar["DBF"].slice(-4) >= yearStart && currentVar["DBF"].slice(-4) <= yearEnd){
                            //Compare Month
                            for (eachMonth in month){
                                if(currentVar["DBF"].substr(0, currentVar["DBF"].indexOf('/')) == month[eachMonth]){
                                    //Compare ethnicity
                                    for(eachEthnicity in ethnicity) {
                                        if(currentVar["Race / Ethnicity"].includes(ethnicity[eachEthnicity])){

                                            //Only add records to new filtered list if it has not been added already, accounts for data issues in ethnicity
                                            //First add the first record to the filtered so there a value to compare to if the records is already added
                                            if(data[eachArea].properties.filtered.length < 1){
                                                currentDB.features[eachArea].properties.filtered.push(currentVar);

                                            } else {
                                                // Then if the case is not already in the array, add it
                                                if (!(currentVar["Case Number"] in data[eachArea].properties.filtered)){
                                                    currentDB.features[eachArea].properties.filtered.push(currentVar);
                                                }
                                            }
                                            // Break to stop comparing when record person has multiple ethnicities
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if (dataSelected[0] === "unidentified-persons") {
        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.unidentified){
                var currentVar = data[eachArea].properties.unidentified[eachRecord];

                //Compare gender first
                for (eachGender in gender){
                    if(currentVar["Sex"] === gender[eachGender]){
                        //Compare age
                        if(Number(currentVar["Age To"]) >= Number(ageFrom) && Number(currentVar["Age From"]) <= Number(ageTo)){
                            //Compare Year
                            if(currentVar["DBF"].slice(-4) >= yearStart && currentVar["DBF"].slice(-4) <= yearEnd){
                                //Compare Month
                                for (eachMonth in month){
                                    if(currentVar["DBF"].substr(0, currentVar["DBF"].indexOf('/')) == month[eachMonth]){
                                        //Compare ethnicity
                                        for(eachEthnicity in ethnicity) {
                                            if(currentVar["Race / Ethnicity"].includes(ethnicity[eachEthnicity])){

                                                //Only add records to new filtered list if it has not been added already, accounts for data issues in ethnicity
                                                //First add the first record to the filtered so there a value to compare to if the records is already added
                                                if(data[eachArea].properties.filtered.length < 1){
                                                    currentDB.features[eachArea].properties.filtered.push(currentVar);

                                                } else {
                                                    // Then if the case is not already in the array, add it
                                                    if (!(currentVar["Case Number"] in data[eachArea].properties.filtered)){
                                                        currentDB.features[eachArea].properties.filtered.push(currentVar);
                                                    }
                                                }
                                                // Break to stop comparing when record person has multiple ethnicities
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    resetMap();
    // Create Filtered Map
    createMap();
}

// Function to retrieve names from currentDB and print out the selected records of that prop symbol
function getNames(){
    console.log(unitSelected);

    if(dataSelected[0] === "missing-persons"){
        // shortand for the filtering below
        data = currentDB.features;

        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.missing){
                console.log(data[eachArea].properties.missing[eachRecord]);
            }
        }

        $('#names-list').html('Test: Missing Names Now Here')
    } else if (dataSelected[0] === "unclaimed-persons"){
        // shortand for the filtering below
        data = currentDB.features;

        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.unclaimed){
                console.log(data[eachArea].properties.unclaimed[eachRecord]);
            }
        }

        $('#names-list').html('Test: UnclaimedNames Now Here')
    } else if (dataSelected[0] === "unidentified-persons"){
        // shortand for the filtering below
        data = currentDB.features;

        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.unidentified){
                console.log(data[eachArea].properties.unidentified[eachRecord]);
            }
        }

        $('#names-list').html('Test: Unidentified Names Now Here')
    } else {
        // shortand for the filtering below
        data = currentDB.features;

        //Loop through each enumeration area
        for (eachArea in data){
            //Loop through each record
            for (eachRecord in data[eachArea].properties.filtered){
                console.log(data[eachArea].properties.filtered[eachRecord]);
            }
        }

        $('#names-list').html('Test: Filtered Names Now Here')
    }
}


/////  Event Listeners  /////

// Database
document.querySelectorAll(".database-check").forEach( input => input.addEventListener('click', getDatabase) );
//Map Scale
document.querySelectorAll(".mapScale-check").forEach( input => input.addEventListener('click', getMapScale) );
// Reset Button
document.querySelectorAll(".reset-btn").forEach( input => input.addEventListener('click', resetFilterOptions) );
// Submit Button
document.querySelectorAll(".submit-btn").forEach( input => input.addEventListener('click', getFilterOptions) );
//Select All Ethnicity Button
$(document).ready(checkAllEthnicity);
//Select All Months Button
$(document).ready(checkAllMonths);

//Retrieve names from within popup
$("body").on('click','a.retrieveNames', function(e){
    e.preventDefault();
    getNames();
});


//Splash Screen
$(window).on('load',function(){
    $('#splash-screen').modal('show');
});
//Create Mape
$(document).ready(createMap());
