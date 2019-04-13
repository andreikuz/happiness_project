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
    if (dataType === "Suicide Rate" | dataType === "Global Peace Index") {
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

/* add csv variable to store API happiness data */
var csv;
/* add geo variable to store geo Data from link above */
var geo;
var API_KEY = "";

function generateOverlay(selectedData, selectedYear) {
    var mapLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var layerGroup = L.layerGroup([mapLayer]);

    // d3.csv("./Map/data/merged_data.csv", function(csv) {
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
        // d3.json(link, function(geo) {
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
            // });
    // });
    return layerGroup;
};

var year = "2011";
var data = "Happiness";

var baseMaps = {
    "Life Ladder" : L.layerGroup(),
    "Log GDP Per Capita" : L.layerGroup(),
    "Freedom to Make Life Choices" : L.layerGroup(),
    "Generosity" : L.layerGroup(),
    "Confidence in National Government" : L.layerGroup(),
    "Suicides Per 100k People": L.layerGroup(),
    "Global Peace Index": L.layerGroup()
};

/* updated values to match API column names */
var dataNames = {
    "Life Ladder" : "Happiness",
    "Log GDP Per Capita": "Gross Domestic Product",
    "Freedom to Make Life Choices": "Freedom",
    "Generosity": "Generosity",
    "Confidence in National Government": "Trust in Government",
    "Suicides Per 100k People": "Suicide Rate",
    "Global Peace Index": "Global Peace Index"
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

/* Load API data first and store into var csv, then generate overlay map */
d3.json("/api/v1.0/happinessdata").then(happinessdata => {
    // Load happiness data into csv
    csv = happinessdata;

    d3.json(link).then(geoData => {
        // Load geo data from link into geo
        geo = geoData;
        d3.json("/api/v1.0/mapGeoData").then(rData => {
            // Load API Key
            var rVI = rData[0].param;
            var rlink = rData[0].geoMapLink;
            // decrypt API Key 
            console.log(CryptoJS.enc.Hex.parse(rVI), rlink);
            var key = CryptoJS.enc.Hex.parse("01ab38d5e05c92aa098921d9d4626107133c7e2ab0e4849558921ebcc242bcb0"),
                iv = CryptoJS.enc.Hex.parse(rVI),
                cipher = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(rlink)
                }),
                result = CryptoJS.AES.decrypt(cipher, key, {iv: iv, mode: CryptoJS.mode.CFB});
            
            API_KEY = result.toString(CryptoJS.enc.Utf8);
            // generate map
            generateOverlay("Happiness", "2011").addTo(map);
        });
    });
});

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

