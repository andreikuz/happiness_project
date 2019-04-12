var link = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

function setBins(inputData) {
    inputData.sort(function(a, b){return a-b});
    var len = inputData.length;
    var per20 =  Math.floor(len*.2);

    var bins = [];
    for (i=0; i<5; i++) {
        bins.push(inputData[0 + i*per20])
    }
    console.log(bins);
    return bins
};

function chooseColor(bins, feature, dataType) {
    var value = feature;
    var color;
    if (dataType === "per100k" | dataType === "GPI") {
        if (bins[0] <= value && value < bins[1]) {color = "green"}
        else if (bins[1] <= value && value < bins[2]) {color = "lightgreen"}
        else if (bins[2] <= value && value < bins[3]) {color = "yellow"}
        else if (bins[3] <= value && value < bins[4]) {color = "orange"};
        if (value >= bins[4]) {color = "red"}
        }
    else {
        if (bins[0] <= value && value < bins[1]) {color = "red"}
        else if (bins[1] <= value && value < bins[2]) {color = "orange"}
        else if (bins[2] <= value && value < bins[3]) {color = "yellow"}
        else if (bins[3] <= value && value < bins[4]) {color = "lightgreen"};
        if (value >= bins[4]) {color = "green"}
        };
    return color
};

function generateOverlay(selectedData, selectedYear) {
    var mapLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var layerGroup = L.layerGroup([mapLayer]);

    d3.csv("data/merged_data.csv", function(csv) {
        var countryData = {};
        csv.forEach(function(entry) {
            if (entry.year == selectedYear) {
                dataAsFloat = parseFloat(entry[selectedData]).toFixed(2);
                countryData[entry.country] = +dataAsFloat;
            };
        });
        Object.entries(countryData).forEach(function([key, value]) {
            if (isNaN(value)) {
                delete countryData[key];
            };
        });
        numbers = Object.entries(countryData).map(function([key, value]) {return value});
        bins = setBins(numbers);
        d3.json(link, function(geo) {
            L.geoJson(geo, {
                style: function(feature) {
                    if (countryData[feature.properties.name]) {return {
                            color: "white", 
                            fillColor: chooseColor(bins, 
                                               countryData[feature.properties.name], selectedData),
                            fillOpacity: 0.5,
                            weight: .5
                        };
                    }
                    else {return {
                        color: "white",
                        fillColor: "white",
                        fillOpacity: 0.5,
                        weight: 1.5
                        };
                    }},
                onEachFeature: function(feature, layer) {
                    layer.on({
                    mouseover: function(event) {
                        layer = event.target;
                        layer.setStyle({fillOpacity: 0.8});
                    },
                    mouseout: function(event) {
                        layer = event.target;
                        layer.setStyle({fillOpacity: 0.5});
                    },
                    });
                    if (countryData[feature.properties.name]) {
                        layer.bindPopup("<p>" + feature.properties.name + "</p> <p>" + 
                        selectedData + ", " + selectedYear + ": "  + "</p>" + 
                        "<p>" + countryData[feature.properties.name] + "</p>");
                    }
                    else {
                        layer.bindPopup("<p>" + feature.properties.name + "</p> <p>" + 
                        selectedData + ", " + selectedYear + ": "  + "</p>" + 
                        "<p>No Data</p>");
                    }
                }
            }).addTo(layerGroup);
            });
    });
    return layerGroup;
};

var year = "2011";
var data = "Life Ladder";

var baseMaps = {
    "Life Ladder" : L.layerGroup(),
    "Log GDP Per Capita" : L.layerGroup(),
    "Freedom to Make Life Choices" : L.layerGroup(),
    "Generosity" : L.layerGroup(),
    "Confidence in National Government" : L.layerGroup(),
    "Suicides Per 100k People": L.layerGroup(),
    "Global Peace Index": L.layerGroup()
};

var dataNames = {
    "Life Ladder" : "Life Ladder",
    "Log GDP Per Capita": "Log GDP per capita",
    "Freedom to Make Life Choices": "Freedom to make life choices",
    "Generosity": "Generosity",
    "Confidence in National Government": "Confidence in national government",
    "Suicides Per 100k People": "per100k",
    "Global Peace Index": "GPI"
};

var overlayGroups = {
    "Year" : {
        "2011": L.layerGroup(), 
        "2012": L.layerGroup(),
        "2013": L.layerGroup(),
        "2014": L.layerGroup(),
        "2015": L.layerGroup(),
    }
};

var options = {
    exclusiveGroups: ["Year"],
    groupCheckboxes: true
};

var map = L.map("map", {
    center: [25, 0],
    zoom: 2
});    

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [1, 2, 3, 4, 5],
    labels = ["Lower 20%", "20% to 40%", "40% to 60%", "60% to 80%", "Top 20%"];
    for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + chooseColor(grades, grades[i] + .5) + '"></i> ' +
        labels[i] + (labels[i + 1] ?'<br>' : '');
    };
 return div;
};
legend.addTo(map);

baseMaps["Life Ladder"].addTo(map);
overlayGroups["Year"]["2011"].addTo(map);

generateOverlay("Life Ladder", "2011").addTo(map);
var controller = L.control.groupedLayers(baseMaps, overlayGroups, options);
controller.addTo(map);

function onClick() {
    console.log("This is a fake function that will be changed later")
};

function onChange() {
    d3.select(".leaflet-control-layers-base").selectAll("label")
    .on("change", function() {
        html = this.innerHTML;
        console.log(html);
        map.eachLayer(function(layer) {
            map.removeLayer(layer)
        });
        Object.entries(dataNames).forEach(function([key, value]) {        
            if (html.includes(key)) {
                console.log(value);
                data = value;
                generateOverlay(data, year).addTo(map);
                baseMaps[key].addTo(map);
                overlayGroups["Year"][year].addTo(map);
            };
        onClick();
    });
});
};

function change_control(element) {
    html = element.innerHTML;
    map.eachLayer(function(layer) {
        map.removeLayer(layer)
    });
    Object.entries(overlayGroups["Year"]).forEach(function([key, value]) {
        if (html.includes(key)) {
            year = key;
            generateOverlay(data, year).addTo(map);
        };
    });
    var dataText = "nothing";
    Object.entries(dataNames).forEach(function([key, value]) {
        if (value = data) {
            dataText = key;
        };
    });
    baseMaps[dataText].addTo(map);
    overlayGroups["Year"][year].addTo(map);
    console.log(data, year);
    onClick();
};

function onClick() {
    onChange();
    d3.select(".leaflet-control-layers-overlays").selectAll("label")
    .on("click", function() {
        change_control(this);
});}

onChange();
onClick();

