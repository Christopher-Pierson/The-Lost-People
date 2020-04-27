//declare map var in global scope
var map;
var dataStats = {min:50, max:7000, mean:1000}; //manually created values for the total combined numbers

//Declare Database global variables
var currentDB; //current json on map
var currentDBFiltered; //current filtered database if ther is one
var dataSelected = ["combined-database", "state-scale"]
//Declare Filter option global variables
var database = "combined-database";
var mapScale = "state-scale";
var gender = ["Female", "Male"];
var ageFrom = 0;
var ageTo = 120;
var ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
var yearStart = 1900;
var yearEnd = 2020;
var Month = [1,2,3,4,5,6,7,8,9,10,11,12]


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

    //call getData function
    getData(map);
};

//Function to instantiate the Filtered Data Leaflet map
function createMapFiltered(){
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
	    ubdomains: 'abcd'
    }).addTo(map);

    //call getDataFiltered function
    getDataFiltered(map);
};

//Import GeoJSON data
function getData(map){
    // Depending on what info is clicked, select the correct data
    if (dataSelected[0] === "combined-database" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/summary_counts.json", function(response){
            //create an attributes array
            var attributes = processData(response, "combined"); // attributes = Total Number

            // calcStats(response);
            createPropSymbols(response, attributes, "combined");
            createLegend(attributes[0], "combined");
        });
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response);
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response);
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "state-scale") {
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response);
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

        // calcStats(response);
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
            radius: 8,
            fillColor: "#3CB371",
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
            radius: 8,
            fillColor: "#000066",
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
            radius: 8,
            fillColor: "#990000",
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
            radius: 8,
            fillColor: "#800080",
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
        var options = {
            radius: 8,
            fillColor: "#FF7F50",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties.filtered.length);

        var popupContent = createPopupContentExtra(feature, attValue, keyword);
    }

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

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
function calcPropRadius(attValue) {
    // Picked values that look normal
    var minValue = 5;
    //constant factor adjusts symbol sizes evenly
    minRadius = 1;

    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

    return radius;
};

//Calculate the max, mean, min values of the dataset. Currently not being used as these values are hardcoded.
function calcStats(data){
    //create empty array to store all data values
    var allValues = [];

    //loop through each unit
    for(var unit of data.features){
        //get number of records
        var value = unit.properties.Total_Count;
        //add value to array
        allValues.push(value);
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
                $(container).append('<h3 id="legend-title" ><b>Combined Database</b></h3>');
                $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                //Start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                //array of circle names to base loop on
                var circles = ["max", "mean", "min"];

                //Loop to add each circle and text to svg string
                for (var i=0; i<circles.length; i++){
                    //Assign the r and cy attributes
                    var radius = calcPropRadius(dataStats[circles[i]]); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#3CB371" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";


            } else if (keyword === "missing"){
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
                    var radius = calcPropRadius(dataStats[circles[i]]); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#000066" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";
            } else if (keyword === "unidentified"){
                dataStats = {min:50, max:2700, mean:1000}; //manually created values for the total combined numbers
                $(container).append('<h3 id="legend-title" ><b>Unidentified Persons</b></h3>');
                $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                //Start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                //array of circle names to base loop on
                var circles = ["max", "mean", "min"];

                //Loop to add each circle and text to svg string
                for (var i=0; i<circles.length; i++){
                    //Assign the r and cy attributes
                    var radius = calcPropRadius(dataStats[circles[i]]); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#990000" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";
            } else if (keyword === "unclaimed"){
                dataStats = {min:50, max:3000, mean:1500}; //manually created values for the total combined numbers
                $(container).append('<h3 id="legend-title" ><b>Unclaimed Persons</b></h3>');
                $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                //Start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                //array of circle names to base loop on
                var circles = ["max", "mean", "min"];

                //Loop to add each circle and text to svg string
                for (var i=0; i<circles.length; i++){
                    //Assign the r and cy attributes
                    var radius = calcPropRadius(dataStats[circles[i]]); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#800080" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";
            } else if (keyword === "filtered"){
                dataStats = {min:50, max:3000, mean:1500}; //manually created values for the total combined numbers
                $(container).append('<h3 id="legend-title" ><b>Filtered Persons</b></h3>');
                $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                //Start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                //array of circle names to base loop on
                var circles = ["max", "mean", "min"];

                //Loop to add each circle and text to svg string
                for (var i=0; i<circles.length; i++){
                    //Assign the r and cy attributes
                    var radius = calcPropRadius(dataStats[circles[i]]); //Manually set radius of circles
                    var cy = (180 - radius) -40;

                    //circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#FF7F50" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                    //evenly space out labels
                    var textY = i * 40 + 50; //spacing + y value

                    //text string
                    svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                };

                //close svg string
                svg += "</svg>";
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
    database = document.querySelector('.database-check:checked').value;
    var container = L.DomUtil.get('map');

    if (database === "missing-persons") {
        $('.data-header').html("Data: Missing Persons");
        $('#date-gone-found').html("Date Last Seen");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', true);
        $("#gender-unsure").attr('disabled', true);
        dataSelected[0] = "missing-persons";
        resetFilterOptions();

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    } else if (database === "unidentified-persons") {
        $('.data-header').html("Data: Unidentified Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', false);
        $("#gender-unsure").attr('disabled', false);
        dataSelected[0] = "unidentified-persons";
        resetFilterOptions();

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    } else if (database === "unclaimed-persons") {
        $('.data-header').html("Data: Unclaimed Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', true);
        $("#gender-unsure").attr('disabled', true);
        dataSelected[0] = "unclaimed-persons";
        resetFilterOptions();

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    } else if (database === "combined-database") {
        $('.data-header').html("Data: Combined Database");
        $('#collapseTwo').collapse('hide');
        $('#collapseThree').collapse('hide');
        $('#date-gone-found').html("...");
        $('#adv-filt').attr('data-toggle', "");
        dataSelected[0] = "combined-database";
        resetFilterOptions();

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    }
}

// Retrieve which map scale is selected and update map
function getMapScale(){
    mapScale = document.querySelector('.mapScale-check:checked').value;
    var container = L.DomUtil.get('map');

    if (mapScale === "state-scale") {
        $('.mapScale-header').html("Map Scale: State");
        dataSelected[1] = "state-scale";

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    } else if (mapScale === "county-scale") {
        $('.mapScale-header').html("Map Scale: County");
        dataSelected[1] = "county-scale";

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
        createMap();
    } else if (mapScale === "city-scale") {
        $('.mapScale-header').html("Map Scale: City");
        dataSelected[1] = "city-scale";

        map.remove();
        if(container != null){
            container._leaflet_id = null;
        }
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

    gender = ["Female", "Male"];
    ageFrom = 0;
    ageTo = 100;
    ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
    yearStart = 1900;
    yearEnd = 2020;
    Month = [1,2,3,4,5,6,7,8,9,10,11,12]

    // var container = L.DomUtil.get('map');
    // map.remove();
    //     if(container != null){
    //         container._leaflet_id = null;
    // }
    // createMap();
}

// Retrieve which advanced filter options are selected
function getFilterOptions(){
    //Check to make sure ageFrom is not older than ageTo and yearStart is not later than yearEnd
    //If it passes those checks, than accept the form
    if ($('#ageFrom-check').val() > $('#ageTo-check').val()){
        alert("Submission not accepted. Age From is later than Age To.");
    } else if ($('#yearStart-check').val() > $('#yearEnd-check').val()) {
        alert("Submission not accepted. Year Start is later than Year End.");
    } else {
        gender = getCheckedGender();
        ageFrom = document.querySelector('#ageFrom-check').value; //$('#ageFrom-check').val())
        ageTo = document.querySelector('#ageTo-check').value;
        ethnicity = getCheckedEthnicity();
        yearStart = document.querySelector('#yearStart-check').value;
        yearEnd = document.querySelector('#yearEnd-check').value;
        month = getCheckedMonth();

        doAdvanceFilter();
    }
}

// Function to filter the data per the selected options
function doAdvanceFilter() {
    // console.log(database);
    // console.log(mapScale);
    // console.log(gender);
    // console.log(ageFrom);
    // console.log(ageTo);
    // console.log(ethnicity);
    // console.log(yearStart);
    // console.log(yearEnd);
    // console.log(month);

    // shortand for the filtering below
    data = currentDB.features;

    // Make sure filter is empty before applying new filter
    for (eachArea in currentDB.features){
        currentDB.features[eachArea].properties.filtered = [];
    }

    //Loop through all of the records comparing the filtered options to the record
    if (database === "missing-persons") {
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
    } else if (database === "unclaimed-persons") {
        for (each in currentDB){
            console.log(currentDB[each].properties.unclaimed);

        }
    } else if (database === "unidentified-persons") {
        for (each in currentDB){
            console.log(currentDB[each].properties.unidentified);

        }
    }

    // Clear map before creating filtered view
    var container = L.DomUtil.get('map');
    map.remove();
    if(container != null){
        container._leaflet_id = null;
    }

    // Create Filtered Map
    createMapFiltered();

}

// Function to retrieve names from currentDB and print out the selected records of that prop symbol
function getNames(){
    if(database === "missing-persons"){
        console.log(currentDB[0].properties.missing);
        for (each in currentDB[0].properties.missing){
        }

        $('#names-list').html('Test: Missing Names Now Here')
    } else if (database === "unclaimed-persons"){
        console.log(currentDB[0].properties.unclaimed);

        $('#names-list').html('Test: UnclaimedNames Now Here')
    } else if (database === "unidentified-persons"){
        console.log(currentDB[0].properties.unidentified);

        $('#names-list').html('Test: Unidentified Names Now Here')
    } else if (database === "filtered-persons"){
        console.log(currentDB[0].properties.filtered);

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
