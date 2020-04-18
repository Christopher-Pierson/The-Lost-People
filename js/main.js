// Map of GeoJSON data from StatesFireData.geojson */

//declare map var in global scope
var map;

//Function to instantiate the Leaflet map
function createMap(){
    //create the map
    myBounds = new L.LatLngBounds(new L.LatLng(60, 0), new L.LatLng(30, 0));
    map = L.map('map', {
        zoomControl: false,
        center: [38, -96],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        maxBounds: [[75, -180], [0, -10]],
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
    // getData();
};

$(window).on('load',function(){
    $('#splash-screen').modal('show');
});
$(document).ready(createMap);