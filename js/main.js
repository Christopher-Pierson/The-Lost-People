//declare map var in global scope
var map;
var dataStats = {min:50, max:7000, mean:1000}; //manually created values for the total combined numbers

//Declare Filter option global variables
var database = "combined-database";
var mapScale = "state-scale";
var gender = "all";
var ageFrom = 0;
var ageTo = 100;
var ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
var yearFrom = 1900;
var yearTo = 2020;
var Month = [1,2,3,4,5,6,7,8,9,10,11,12]


///// Functions for Map
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
        maxBounds: [[75, -180], [-30, -10]], // [top, left], [bottom, right]
    });

    // Add zoom control (but in top right)
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    //Add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
    }).addTo(map);

    //call getData function
    getData();
};

//Import GeoJSON data
function getData(map){
    ////////// Depending on what info is clicked, here is where we select which database

    //load the data
    $.getJSON("data/JSON/summary_counts.json", function(response){
        //create an attributes array
        var attributes = processData(response, "Total_Count"); // attributes = Total Number
            
        // calcStats(response);
        createPropSymbols(response, attributes);
        createLegend(attributes[0]);
    });
};

//Build an attributes array from the data
function processData(data, keyword){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with acres values
        if (attribute.indexOf(keyword) > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

// Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    // Determine which attribute to visualize with proportional symbols
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];

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

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,(-options.radius)/2) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
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
    
    //loop through each state
    for(var state of data.features){
        //get number of records
        var value = state.properties.Total_Count;
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
function createLegend(attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            $(container).append('<h2 id="legend-title" ><b>Total Records</b></h2>');

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

            //add attribute legend svg to container
            $(container).append(svg);

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new LegendControl());
};


/////  Filter Functions  /////
// Retrieve which database is selected
function getDatabase(){
    console.log( document.querySelector('.database-check:checked').value );
    database = document.querySelector('.database-check:checked').value;
}

// Retrieve which map scale is selected
function getMapScale(){
    console.log( document.querySelector('.mapScale-check:checked').value );
    mapScale = document.querySelector('.mapScale-check:checked').value;
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

    gender = "all";
    ageFrom = 0;
    ageTo = 100;
    ethnicity = ["American Indian / Alaska Native", "Asian", "Black / African American", "Hawaiian / Pacific Islander", "Hispanic / Latino", "White / Caucasian", "Other", "Uncertain"];
    yearFrom = 1900;
    yearTo = 2020;
    Month = [1,2,3,4,5,6,7,8,9,10,11,12]
}

// Retrieve which advanced filter options are selected
function getFilterOptions(){
    gender = document.querySelector('.gender-check:checked').value; //$('.gender-check:checked').val())
    ageFrom = document.querySelector('#ageFrom-check').value;
    ageTo = document.querySelector('#ageTo-check').value;
    ethnicity = getCheckedEthnicity();
    yearFrom = document.querySelector('#yearFrom-check').value;
    yearTo = document.querySelector('#yearTo-check').value;
    month = getCheckedMonth();

    console.log(gender);
    console.log(ageFrom);
    console.log(ageTo);
    console.log(ethnicity);
    console.log(yearFrom);
    console.log(yearTo);
    console.log(month);
}


/////  Event Listeners for Filters  /////

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


//Splash Screen
$(window).on('load',function(){
    $('#splash-screen').modal('show');
});
//Create Mape
$(document).ready(createMap);