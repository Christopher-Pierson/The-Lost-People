//declare map var in global scope
var map; //Background map
var mapSymbols; // Proportional Symbols
var mapFeatures; // Feature polygon units
var LegendControl; // Legend
var dataStats = {min:50, max:7000, mean:1000}; //manually created values for the total combined numbers
var centerPoint = [38, -87];
var zoomLevel = 4;

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

//Declare API key and other options for OpenCageData geocoder
var options = {
  key: 'c0a1ea5b826c49e0bdfb6831aa2c00b3',
  limit: 5, // number of results to be displayed
  position: 'topright',
  placeholder: 'Search for a place...', // the text in the empty search box
  errorMessage: 'Nothing found.',
  showResultIcons: false,
  collapsed: true,
  expand: 'click',
  addResultToMap: true, // if a map marker should be added after the user clicks a result
  onResultClick: undefined, // callback with result as first parameter
};

// declage array of easy buttons for home and non-contiguous states/territories set views
var buttons = [
  L.easyButton('fa-home', function(){
      map.setView([38, -87], 4);
  },'zoom to original extent',{ position: 'topright' }),

  L.easyButton('<strong>AK</strong>', function(){
      map.setView([65.144912, -152.541399], 3.5);
  },'zoom to Alaska',{ position: 'topright' }),

  L.easyButton('<strong>HI</strong>', function(){
      map.setView([20.891499, -157.959362], 6.29);
  },'zoom to Hawaii',{ position: 'topright' }),

  L.easyButton('<strong>GU</strong>', function(){
      map.setView([13.432056, 144.812821], 10.5);
  },'zoom to Guam',{ position: 'topright' }),

  L.easyButton('<strong>MP</strong>', function(){
      //map.setView([16.530659, 146.027901], 6.35); alternative view of all islands
      map.setView([15.097820, 145.642088], 10.5);
  },'zoom to North Mariana Islands',{ position: 'topright' }),

  L.easyButton('<strong>PR</strong>', function(){
      map.setView([18.254990, -66.423918], 9.25);
  },'zoom to Puerto Rico',{ position: 'topright' }),

  L.easyButton('<strong>VI</strong>', function(){
       map.setView([17.970324, -64.727032], 10);
   },'zoom to U.S. Virgin Islands',{ position: 'topright' })
];

///// Functions for Map /////
//Function to instantiate the Leaflet map
function createMap(){
    //create the map
    myBounds = new L.LatLngBounds(new L.LatLng(60, 0), new L.LatLng(30, 0));
    map = L.map('map', {
        zoomControl: false,
        center: centerPoint,
        zoom: zoomLevel,
        minZoom: 3,
        maxZoom: 12,
        maxBounds: [[75, -180], [-30, 180]], // [top, left], [bottom, right]
        attributionControl: false
    });

    // place attribution bar in bottom left of map, instead of default bottom right
    L.control.attribution({position: 'bottomleft'}).addTo(map);

    // Add place searchbar to map
    L.Control.openCageSearch(options).addTo(map);

    // Add zoom control (but in top right)
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // build easy bar from array of easy buttons
    L.easyBar(buttons).addTo(map);

    // Add easy button to pull up splash screen
    L.easyButton('fa-info-circle', function(){
        $('#splash-screen').modal('show');
        map.setView([38, -87], 4);
    },'zoom to original extent',{ position: 'topright' }).addTo(map);

    //Add OSM base tilelayer
    L.tileLayer('https://api.mapbox.com/styles/v1/pierson/ck9uh6fx202ni1io1459nmyht/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
        accessToken: 'pk.eyJ1IjoicGllcnNvbiIsImEiOiJjanp6c2ZvMjIwZWdjM21waXJpNzhsYTdlIn0.WnrNdPyPhiFYUuoYKF1caw'
    }).addTo(map);

    getData(map);
};

//Import GeoJSON data depending on what info is clicked, select the correct data
function getData(map){
    // Combined Databases
    if (dataSelected[0] === "combined-database" && dataSelected[1] === "state-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/state_poly_counts.json", function(response){
            mapFeatures = L.geoJson(response, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/summary_counts.json", function(response){
            //create an attributes array
            var attributes = processData(response, "combined"); // attributes = Total Number

            // calcStats(response, "combined");
            createPropSymbols(response, attributes, "combined");
            createLegend(attributes[0], "combined");
        });
    } else if (dataSelected[0] === "combined-database" && dataSelected[1] === "county-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/county_poly_counts.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
              }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/county_counts.json", function(response){
            //create an attributes array
            var attributes = processData(response, "combined"); // attributes = Total Number

            // calcStats(response, "combined");
            createPropSymbols(response, attributes, "combined");
            createLegend(attributes[0], "combined");
        });
    } else if (dataSelected[0] === "combined-database" && dataSelected[1] === "city-scale") {
        //load the data
        $.getJSON("data/JSON/city_counts.json", function(response){
            //create an attributes array
            var attributes = processData(response, "combined"); // attributes = Total Number

            // calcStats(response, "combined");
            createPropSymbols(response, attributes, "combined");

            createLegend(attributes[0], "combined");
        });
    // Missing Persons Databases
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "state-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/state_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature,
            }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response, "missing");
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "county-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/county_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
                }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response, "missing");
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    } else if (dataSelected[0] === "missing-persons" && dataSelected[1] === "city-scale") {
        //load the data
        $.getJSON("data/JSON/city_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "missing");

            // calcStats(response, "missing");
            createPropSymbols(response, attributes, "missing");
            createLegend(attributes[0], "missing");
        });
    // Unidentified Persons Databases
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "state-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/state_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
              }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response, "unidentified");
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "county-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/county_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
                }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response, "unidentified");
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    } else if (dataSelected[0] === "unidentified-persons" && dataSelected[1] === "city-scale") {
        //load the data
        $.getJSON("data/JSON/city_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unidentified");

            // calcStats(response, "unidentified");
            createPropSymbols(response, attributes, "unidentified");
            createLegend(attributes[0], "unidentified");
        });
    // Unclaimed Databases
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "state-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/state_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
              }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/state_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response, "unclaimed");
            createPropSymbols(response, attributes, "unclaimed");
            createLegend(attributes[0], "unclaimed");
        });
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "county-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/county_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
                }).addTo(map);
        });
        //load the data
        $.getJSON("data/JSON/county_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response, "unclaimed");
            createPropSymbols(response, attributes, "unclaimed");
            createLegend(attributes[0], "unclaimed");
        });
    } else if (dataSelected[0] === "unclaimed-persons" && dataSelected[1] === "city-scale") {
        //load the data
        $.getJSON("data/JSON/city_geojson.json", function(response){
            //create an attributes array
            var attributes = processData(response, "unclaimed");

            // calcStats(response, "unclaimed");
            createPropSymbols(response, attributes, "unclaimed");
            createLegend(attributes[0], "unclaimed");
        });
    }
    // L.control.layers(mapFeatures, mapSymbols).addTo(map);
};

//Set the intial style of the feature units
function style(feature) {
    return {
        fillColor: 'black',
        weight: 1,
        opacity: 1,
        color: 'none',
        fillOpacity: 0
    };
}

//Highlight polygon feature
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

//Remove polygon feature highlight
function resetHighlight(e) {
    mapFeatures.resetStyle(e.target);
}

// Creates and activates a popup for the polygon feature
function polyPopup(e) {
    var poly = e.target.feature;

    if (dataSelected[1] === "state-scale") {
        unitSelected = poly.name;

        if (dataSelected[0] === "combined-database"){

            //Create the popup content for the combined dataset layer
            var popupContent = createPopupContent(poly.properties);

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,0)
            }).openPopup();
        } else if (dataSelected[0] === "missing-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.missing.length);

            var popupContent = createPopupContentExtra(poly, attValue, "missing");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "missing-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;
            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState].name){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "missing");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.unidentified.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unidentified");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;
            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState].name){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unidentified");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.unclaimed.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unclaimed");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;
            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState].name){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unclaimed");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        }
    } else if (dataSelected[1] === "county-scale") {
        unitSelected = poly["county_FIPS"];

        if (dataSelected[0] === "combined-database"){

            //Create the popup content for the combined dataset layer
            var popupContent = createPopupContent(poly.properties);

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,0)
            }).openPopup();
        } else if (dataSelected[0] === "missing-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.missing.length);

            var popupContent = createPopupContentExtra(poly, attValue, "missing");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "missing-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;

            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState]["county_FIPS"]){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "missing");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.unidentified.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unidentified");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;
            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState]["county_FIPS"]){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unidentified");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == false){
            //For each feature, determine its value for the selected attribute
            var attValue = Number(poly.properties.unclaimed.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unclaimed");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == true){
            //Find the  index in filtered database of the currently selected feature
            var targetIndex = 0;
            for (eachState in currentDB.features){
                if (unitSelected === currentDB.features[eachState]["county_FIPS"]){
                    break;
                }
                targetIndex += 1;
            }

            //For each feature, determine its value for the selected attribute
            var attValue = Number(currentDB.features[targetIndex].properties.filtered.length);

            var popupContent = createPopupContentExtra(poly, attValue, "unclaimed");

            //bind the popup to the polygon
            e.target.bindPopup(popupContent, {
                offset: new L.Point(0,-20)
            }).openPopup();
        }
    } else if (dataSelected[1] === "city-scale") {
        // No polygons for city level
    }
}

//Event listeners for highlighing the polygon features
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: polyPopup
    });
}

//Get Data for filtered
function getDataFiltered(map){
    if (dataSelected[1] === "state-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/state_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
              }).addTo(map);
        });
    } else if (dataSelected[1] === "county-scale") {
        //Create the enumeration unit boundaries
        $.getJSON("data/JSON/county_poly_geojson.json", function(response){
            mapFeatures = new L.GeoJSON(response, {
                style: style,
                onEachFeature: onEachFeature
              }).addTo(map);
        });
    }

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
    mapSymbols = L.geoJson(data, {
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
            weight: 0.5,
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
            weight: 0.5,
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
            weight: 0.5,
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
            weight: 0.5,
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
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
        } else if (dataSelected[0] === "unidentified-persons") {
            var options = {
                fillColor: "#F2B872",
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
        } else if (dataSelected[0] === "unclaimed-persons") {
            var options = {
                fillColor: "#D96A6A",
                color: "#000",
                weight: 0.5,
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
    }

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

        //bind the popup to the circle marker if its a city
    if (dataSelected[1] === "city-scale") {
        layer.bindPopup(popupContent, {
            offset: new L.Point(0,(-options.radius)/2)
        });
    }

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Creates text for the popups in the prop symbols
function createPopupContentExtra(feature, attValue, keyword){
    //add name to popup content string
    if (dataSelected[1] === "city-scale") {
        var popupContent = "<p class='popup-feature-name'><b>" + feature.name + ", " + feature.state_abbr + "</b></p>";
    } else if (dataSelected[1] === "county-scale") {
        var popupContent = "<p class='popup-feature-name'><b>" + feature.name + " County</b></p>";
    } else {
        var popupContent = "<p class='popup-feature-name'><b>" + feature.name + "</b></p>";
    }

    //add formatted attribute to panel content string
    if (keyword === "missing") {
        popupContent += "<p class='popup-record-count'>Number of <span id='missing-record'><b>Missing</b></span> Persons Records: <b><span id='missing-record'>" +attValue + "</span></b></p>";

        popupContent += '<a class="retrieveNames" href="#" style="color: #6e6e6e; font-style: italic">Click here to Retrieve List of Records</a>';
    } else if (keyword === "unidentified") {
        popupContent += "<p class='popup-record-count'>Number of <span id='unidentified-record'><b>Unidentified</b></span> Persons Records: <b><span id='unidentified-record'>" +attValue + "</span></b></p>";

        popupContent += '<a class="retrieveNames" href="#" style="color: #6e6e6e; font-style: italic">Click here to Retrieve List of Records</a>';
    } else if (keyword === "unclaimed") {
        popupContent += "<p class='popup-record-count'>Number of <span id='unclaimed-record'><b>Unclaimed</b></span> Persons Records: <b><span id='unclaimed-record'>" +attValue + "</span></b></p>";

        popupContent += '<a class="retrieveNames" href="#" style="color: #6e6e6e; font-style: italic">Click here to Retrieve List of Records</a>';
    } else if (keyword === "filtered") {
        popupContent += "<p class='popup-record-count'>Number of Filtered Persons Records: <b>" +attValue + "</b></p>";

        popupContent += '<a class="retrieveNames" href="#" style="color: #6e6e6e; font-style: italic">Click here to Retrieve List of Records</a>';
    }

    return popupContent;
};

// Creates text for the popups in the prop symbols
function createPopupContent(properties, attribute){
    //add name to popup content string
    if (dataSelected[1] === "city-scale") {
        var popupContent = "<p class='popup-feature-name'><b>" + properties.CITY_NAME + ", " + properties.STUSPS + "</b></p>";

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
        popupContent += "<p class='popup-record-count'><b>Number of <span id='combined-record'>Combined</span> Dataset Records: <span id='combined-record'>" + combined + "</span></b></p>";
        popupContent += "<p class='popup-record-count'>Number of <span id='missing-record'><b>Missing</b></span> Persons Records: <b><span id='missing-record'>" + missing + "</span></b></p>";
        popupContent += "<p class='popup-record-count'>Number of <span id='unidentified-record'><b>Unidentified</b></span> Persons Records: <b><span id='unidentified-record'>" + unidentified + "</span></b></p>";
        popupContent += "<p class='popup-record-count'>Number of <span id='unclaimed-record'><b>Unclaimed</b></span> Persons Records: <b><span id='unclaimed-record'>" + unclaimed + "</span></b></p>";

        return popupContent;

    } else if (dataSelected[1] === "county-scale") {
        var popupContent = "<p class='popup-feature-name'><b>" + properties.NAME + " County</b></p>";
    } else {
        var popupContent = "<p class='popup-feature-name'><b>" + properties.NAME + "</b></p>";
    }

    //get combined record number
    var combined = properties.Total_Count;
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
    popupContent += "<p class='popup-record-count'><b>Number of <span id='combined-record'>Combined</span> Dataset Records: <span id='combined-record'>" + combined + "</span></b></p>";
    popupContent += "<p class='popup-record-count'>Number of <span id='missing-record'><b>Missing</b></span> Persons Records: <b><span id='missing-record'>" + missing + "</span></b></p>";
    popupContent += "<p class='popup-record-count'>Number of <span id='unidentified-record'><b>Unidentified</b></span> Persons Records: <b><span id='unidentified-record'>" + unidentified + "</span></b></p>";
    popupContent += "<p class='popup-record-count'>Number of <span id='unclaimed-record'><b>Unclaimed</b></span> Persons Records: <b><span id='unclaimed-record'>" + unclaimed + "</span></b></p>";

    return popupContent;

};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue, keyword) {
    if (dataSelected[1] === "state-scale") {
        if (keyword === "combined"){
            // Picked values that look normal
            var minValue = 10;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else if (keyword === "missing") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.8;
        } else if (keyword === "unidentified") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.8;
        } else if (keyword === "unclaimed") {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else {
            // Picked values that look normal
            var minValue = 5;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        }
    } else if (dataSelected[1] === "county-scale") {
        if (keyword === "combined"){
            // Picked values that look normal
            var minValue = 2;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else if (keyword === "missing") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else if (keyword === "unidentified") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.3;
        } else if (keyword === "unclaimed") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.3;
        } else {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        }
    } else if (dataSelected[1] === "city-scale") {
        if (keyword === "combined"){
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.3;
        } else if (keyword === "missing") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
        } else if (keyword === "unidentified") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.8;
        } else if (keyword === "unclaimed") {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.7;
        } else {
            // Picked values that look normal
            var minValue = 1;
            //constant factor adjusts symbol sizes evenly
            var minRadius = 1.5;
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
    LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            if (keyword === "combined"){
                if (dataSelected[1] === "state-scale") {
                    dataStats = {min:50, max:7000, mean:2000};
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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#78BFA5" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };
                } else if (dataSelected[1] === "county-scale"){
                    dataStats = {min:10, max:1700, mean:300}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Combined Databases</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -35;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#78BFA5" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "city-scale"){
                    dataStats = {min:5, max:1000, mean:200}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Combined Databases</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -35;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#78BFA5" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                }
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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                    var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -40;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "city-scale"){
                    dataStats = {min:5, max:250, mean:100}; //manually created values for the total combined numbers

                    $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                    $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                    //Start attribute legend svg string
                    var svg = '<svg id="attribute-legend" width="270px" height="120px">';

                    //array of circle names to base loop on
                    var circles = ["max", "mean", "min"];

                    //Loop to add each circle and text to svg string
                    for (var i=0; i<circles.length; i++){
                        //Assign the r and cy attributes
                        var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                        var cy = (180 - radius) -70;

                        //circle string
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 30 + 50; //spacing + y value

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "city-scale"){
                    dataStats = {min:5, max:500, mean:100}; //manually created values for the total combined numbers

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "county-scale"){
                    dataStats = {min:5, max:1000, mean:300}; //manually created values for the total combined numbers

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

                        //evenly space out labels
                        var textY = i * 40 + 50; //spacing + y value

                        //text string
                        svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                    };

                    //close svg string
                    svg += "</svg>";
                } else if (dataSelected[1] === "city-scale"){
                    dataStats = {min:5, max:600, mean:200}; //manually created values for the total combined numbers

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
                        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                        var svg = '<svg id="attribute-legend" width="270px" height="150px">';

                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];

                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -40;

                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value

                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };

                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "city-scale"){
                        dataStats = {min:5, max:250, mean:100}; //manually created values for the total combined numbers

                        $(container).append('<h3 id="legend-title" ><b>Missing Persons</b></h3>');
                        $(container).append('<h3 id="legend-title" ><b>Total Records</b></h3>');

                        //Start attribute legend svg string
                        var svg = '<svg id="attribute-legend" width="270px" height="120px">';

                        //array of circle names to base loop on
                        var circles = ["max", "mean", "min"];

                        //Loop to add each circle and text to svg string
                        for (var i=0; i<circles.length; i++){
                            //Assign the r and cy attributes
                            var radius = calcPropRadius(dataStats[circles[i]], keyword); //Manually set radius of circles
                            var cy = (180 - radius) -70;

                            //circle string
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#66A3D9" fill-opacity="1" stroke="#000000" cx="88"/>';

                            //evenly space out labels
                            var textY = i * 30 + 50; //spacing + y value

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value

                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };

                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "city-scale"){
                        dataStats = {min:5, max:500, mean:100}; //manually created values for the total combined numbers

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F2B872" fill-opacity="1" stroke="#000000" cx="88"/>';

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value

                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };

                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "county-scale"){
                        dataStats = {min:5, max:600, mean:100}; //manually created values for the total combined numbers

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

                            //evenly space out labels
                            var textY = i * 40 + 50; //spacing + y value

                            //text string
                            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " persons" + '</text>';
                        };

                        //close svg string
                        svg += "</svg>";
                    } else if (dataSelected[1] === "city-scale"){
                        dataStats = {min:5, max:600, mean:200}; //manually created values for the total combined numbers

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
                            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#D96A6A" fill-opacity="1" stroke="#000000" cx="88"/>';

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
        dataFiltered = false;
        resetFilterOptions();
        $('.data-header').html("Data: Unidentified Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', false);
        $("#gender-unsure").attr('disabled', false);

    } else if (dataSelected[0] === "unclaimed-persons") {
        dataFiltered = false;
        resetFilterOptions();
        $('.data-header').html("Data: Unclaimed Persons");
        $('#date-gone-found').html("Date Body Found");
        $('#adv-filt').attr('data-toggle', "collapse");
        $("#gender-other").attr('disabled', true);
        $("#gender-unsure").attr('disabled', true);

    } else if (dataSelected[0] === "combined-database") {
        dataFiltered = false;
        resetFilterOptions();
        $('.data-header').html("Data: Combined Database");
        // $('#collapseTwo').collapse('hide');
        $('#collapseThree').collapse('hide');
        $('#date-gone-found').html("...");
        $('#adv-filt').attr('data-toggle', "");
    }
}

// Retrieve which map scale is selected and update map
function getMapScale(){
    dataSelected[1] = document.querySelector('.mapScale-check:checked').value;

    if (dataSelected[1] === "state-scale") {
        $('.mapScale-header').html("Map Scale: State");
        dataFiltered = false;

        resetMap();
    } else if (dataSelected[1]=== "county-scale") {
        $('.mapScale-header').html("Map Scale: County");
        dataFiltered = false;

        resetMap();
    } else if (dataSelected[1] === "city-scale") {
        $('.mapScale-header').html("Map Scale: City");
        dataFiltered = false;

        resetMap();
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
    // Remove the Pop symbol layer and the legend
    map.removeLayer(mapSymbols);
    map.removeLayer(mapFeatures);
    $(".secondary").css("display", "none");
    $(".legend-control-container").remove();

    // Get data differently depending on if it is filtered or not
    if (dataFiltered){
        getDataFiltered(map);
    } else {
        getData(map);
    }
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
}

// Function to retrieve names from currentDB and print out the selected records of that prop symbol
function getNames(){
    $(".secondary").css("display", "block");

    var recordsHTML = '<div class="recordGrid">'

    if (dataSelected[1] === "state-scale"){
        if(dataSelected[0] === "missing-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            recordsHTML += '<h3 class="recordGrid-Title">Missing Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.missing){
                    if (data[eachArea].name === unitSelected){
                        console.log(data[eachArea].properties.missing[eachRecord]);
                        recordsHTML += '<p style="font-size: 16px">'+ formatRecords(recordsHTML, data[eachArea].properties.missing[eachRecord]) +'</p>';
                    }
                }
            }
            recordsHTML +='</div>'
            $('#names-list').html(recordsHTML);
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Unclaimed Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.unclaimed){
                    if (data[eachArea].name === unitSelected){
                        console.log(data[eachArea].properties.unclaimed[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.unclaimed[eachRecord]) +"</p>";
                    }
                }
            }

            $('#names-list').html(records)
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Unidentified Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.unidentified){
                    if (data[eachArea].name === unitSelected){
                        console.log(data[eachArea].properties.unidentified[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.unidentified[eachRecord]) +"</p>";
                    }
                }
            }

            $('#names-list').html(records)
        } else { //Filtered records
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Filtered Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.filtered){
                    if (data[eachArea].name === unitSelected){
                        console.log(data[eachArea].properties.filtered[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.filtered[eachRecord]) +"</p>";

                    }
                }
            }

            $('#names-list').html(records)
        }
    } else if (dataSelected[1] === "county-scale") {
        if(dataSelected[0] === "missing-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            recordsHTML += '<h3 class="recordGrid-Title">Missing Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.missing){
                    if (data[eachArea]["county_FIPS"] === unitSelected){
                        console.log(data[eachArea].properties.missing[eachRecord]);
                        recordsHTML += '<p style="font-size: 16px">'+ formatRecords(recordsHTML, data[eachArea].properties.missing[eachRecord]) +'</p>';
                    }
                }
            }
            recordsHTML +='</div>'
            $('#names-list').html(recordsHTML);
        } else if (dataSelected[0] === "unclaimed-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Unclaimed Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.unclaimed){
                    if (data[eachArea]["county_FIPS"] === unitSelected){
                        console.log(data[eachArea].properties.unclaimed[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.unclaimed[eachRecord]) +"</p>";
                    }
                }
            }

            $('#names-list').html(records)
        } else if (dataSelected[0] === "unidentified-persons" && dataFiltered == false){
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Unidentified Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.unidentified){
                    if (data[eachArea]["county_FIPS"] === unitSelected){
                        console.log(data[eachArea].properties.unidentified[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.unidentified[eachRecord]) +"</p>";
                    }
                }
            }

            $('#names-list').html(records)
        } else { //Filtered records
            // shortand for the filtering below
            data = currentDB.features;

            var records = '<h3>Filtered Records</h3>';

            //Loop through each enumeration area
            for (eachArea in data){
                //Loop through each record
                for (eachRecord in data[eachArea].properties.filtered){
                    if (data[eachArea]["county_FIPS"] === unitSelected){
                        console.log(data[eachArea].properties.filtered[eachRecord]);
                        records += "<p style='font-size: 16px'>"+ formatRecords(recordsHTML, data[eachArea].properties.filtered[eachRecord]) +"</p>";

                    }
                }
            }

            $('#names-list').html(records)
        }
    } else if (dataSelected[1] === "city-scale"){
        //Not print able
    }
}

// Retrieve and place the record data in the string
function formatRecords(recordsHTML, data){
    if (dataSelected[0] === "missing-persons") {
        console.log(data);
        var caseNumber = data["Case Number"];
        var firstName = data["First Name"];
        var lastName = data["Last Name"];
        var dlc = data["DLC"];

        return caseNumber + ", " + firstName + " " + lastName + ", " + dlc;

    } else if (dataSelected[0] === "unclaimed-persons") {
        var caseNumber = data["Case Number"];
        var firstName = data["First Name"];
        var lastName = data["Last Name"];
        var dbf = data["DBF"];

        return caseNumber + ", " + firstName + " " + lastName + ", " + dbf;

    } else if (dataSelected[0] === "unidentified-persons") {
        var caseNumber = data["Case Number"];
        var dbf = data["DBF"];
        var sex = data["Sex"];
        var ageF = data["Age From"];
        var ageT = data["Age To"];

        return caseNumber + ", " + dbf + ", " + sex + ", " + ageF + ", " + ageT;
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

//Splash Screen when start
$(window).on('load',function(){
    $('#splash-screen').modal('show');
});
//Create Map
$(document).ready(createMap());
