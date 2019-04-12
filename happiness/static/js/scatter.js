/**
 * Plot scatter plot using d3
 */

// Initialize Global Params
var chosenXAxis = "Gross Domestic Product";  // Default initial x-axis
var chosenYAxis = "Happiness";  // Default initial y-axis
var chosenColor = "Suicide Rate";  // Default initial color
var chosenSize = "Global Peace Index";  // Default initial size
var chosenYear = 2015; // Default initial Year

var happinessMap = null; // Load data: from API json
var happinessData = null;  // Load data: filter happinessMap data by year
var featuresXAxis = null; // Load data from API: array of features for x-axis
var featuresColor = null; // Load data from API: array of features for color
var featuresSize = null; // Load data from API: array of features for size
var years = [2011, 2012, 2013, 2014, 2015, 2016]; // Array of year options
var category = "country"; // non numeric feature

 // Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 400;

// Define the chart's margins as an object
var margin = {
    top: 20,
    right: 0,
    bottom: 20,
    left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

/**
 * Function creates the Color SVG legend
 */
function createColorLegend() {
    // clear color legend
    d3.select("#colorLegend").html("");
    // create color legend
    d3.select("#colorLegend").append("svg")
        .append("g")
            .attr("class", "legendLinear")
            .attr("transform", `translate(${20}, 0)`);
    let legendLinear = d3.legendColor()
        .shapeWidth(30)
        .scale(colorScale());
    d3.select(".legendLinear")
        .call(legendLinear);
}

/**
 * Function creates the Size SVG legend
 */
function createSizeLegend() {
    // clear size legend
    d3.select("#sizeLegend").html("");
    // create size legend
    d3.select("#sizeLegend").append("svg")
        .append("g")
            .attr("class", "legendSize")
            .attr("transform", `translate(${40}, 0)`);
    let legendSize = d3.legendSize()
        .scale(sizeScale())
        .shape('circle')
        .shapePadding(5)
        .labelOffset(10);
    d3.select(".legendSize")
        .call(legendSize);
};

// function used for x-scale var upon select on x-axis
function xScale() {
    // create x scales for chosen x-axis
    minValue = d3.min(happinessData, d => d[chosenXAxis]);
    minValue = (minValue < 0) ? (minValue*1.15) : (minValue*0.85)
    var linearScale = d3.scaleLinear()
        .domain([minValue,
                d3.max(happinessData, d => d[chosenXAxis]) * 1.15])
        .range([0, chartWidth]);

    return linearScale;
};

// function used for size-scale var upon select on size
function sizeScale() {
    // create size scales for chosen size
    var linearScale = d3.scaleLinear()
      .domain([d3.min(happinessData, d => d[chosenSize]),
               d3.max(happinessData, d => d[chosenSize])])
      .range([5, 10]);
  
    return linearScale;
};

// function used for color-scale var upon select on color
function colorScale() {
    var linearScale = d3.scaleLinear()
    .domain([d3.min(happinessData, d => d[chosenColor]),
        d3.max(happinessData, d => d[chosenColor])])
        .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);

    return linearScale;
};

// function used for updating xAxis var upon select on x-axis
function renderXAxis() {
    let xLinearScale = xScale();
    // Render transition between x-axis change
    d3.select("#xAxis").transition()
      .duration(1000)
      .call(d3.axisBottom(xScale()));
    // Render transition of circles
    d3.selectAll(".countryCircle")
        .transition()
        .duration(1000)
        .attr("cx", d => xLinearScale(d[chosenXAxis]));
    // Render transition of text
    d3.selectAll(".countryText")
        .transition()
        .duration(1000)
        .attr("dx", d => xLinearScale(d[chosenXAxis]));
}

// function used for updating size var upon select on size
function renderSize() {
    let sLinearScale = sizeScale();
    // Render transition between circle size change
    d3.selectAll(".countryCircle")
        .transition()
        .duration(1000)
        .attr("r", d => sLinearScale(d[chosenSize]));
    // Refresh legend: size
    // d3.select("#sizeLegend").html("");
    createSizeLegend();
}

// function used for updating color var upon select on color
function renderColor() {
    let cLinearScale = colorScale();
    // Render transition between circle size change
    d3.selectAll(".countryCircle")
        .transition()
        .duration(1000)
        .style("fill", d => cLinearScale(d[chosenColor]));
    
    // Refresh legend: color
    // d3.select("#colorLegend").html("");
    createColorLegend();
}

// function adds tooltips to scatter points (group: circle + text)
function updateToolTip(elemEnter) {
    // Setup the tool tip.  Note that this is just one example, and that many styling options are available.
    // See original documentation for more details on styling: http://labratrevenge.com/d3-tip/
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${d.country}<br>
                    ${chosenYAxis}: ${d[chosenYAxis]}<br>
                    ${chosenXAxis}: ${d[chosenXAxis]}<br>
                    ${chosenColor}: ${d[chosenColor]}<br>
                    ${chosenSize}: ${d[chosenSize]}<br>`);
    d3.select("#scatter svg").call(tool_tip);

    // Assign hover events
    elemEnter.classed("active inactive", true)
    .on('mouseover', tool_tip.show)
    .on('mouseout', tool_tip.hide);
}

// function update features: XAxis, Color, Size. By filtering out year, Y-Axis, catergy, and the others' feature
function updateFeatures() {
    // Filter happiness data for x-Axis features
    featuresXAxis = Object.keys(happinessData[0]).sort()
        .filter(d => ((d!== "year")
            &&(d!== chosenYAxis)
            &&(d !== category)
            &&(d !== chosenColor)
            &&(d !== chosenSize)));
    // Filter happiness data for color features
    featuresColor = Object.keys(happinessData[0]).sort()
        .filter(d => ((d!== "year")
            &&(d!== chosenYAxis)
            &&(d !== category)
            &&(d !== chosenXAxis)
            &&(d !== chosenSize)));
    // Filter happiness data for size features
    featuresSize = Object.keys(happinessData[0]).sort()
        .filter(d => ((d!== "year")
            &&(d!== chosenYAxis)
            &&(d !== category)
            &&(d !== chosenXAxis)
            &&(d !== chosenColor)));
}

// function initialize the chart elements
function init() {
    // Select scatter, append SVG area to it, and set its dimensions
    let svg = d3.select("#scatter")
        .append("svg")
        .classed("chart", true)
        .attr("width", svgWidth)
    .attr("height", svgHeight);

    // shift everything over by the margins
    let chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    // Create initial xLinearScale
    let xLinearScale = xScale();
    let cLinearScale = colorScale();
    let sLinearScale = sizeScale();

    // Create initial yLinearScale
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(happinessData, d => d[chosenYAxis]) * 0.85,
                d3.max(happinessData, d => d[chosenYAxis]) * 1.15])
        .range([chartHeight, 0]);

    // Create initial axis
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .attr("id", "xAxis")
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .classed("axis", true)
      .attr("id", "yAxis")
      .call(leftAxis);

    // Create group for y-axis text
    let yLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90 ${-(margin.left/2)} ${(chartHeight/2)})`)
        .classed("atext", true)
        .attr("id", "yLabels");
    yLabels.append("text")
        .attr("x", -(margin.left/2))
        .attr("y", (chartHeight/2))
        .text(chosenYAxis);
      
    // Define the data for the group: circle + text
    let elem = chartGroup.selectAll("g circle")
        .data(happinessData);
 
    // Create and place the circles and the texts
    let elemEnter = elem.enter()
        .append("g");
    
    // Create the circle for each block
    elemEnter.append("circle")
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', d => sLinearScale(d[chosenSize]))
        .style("fill", d => cLinearScale(d[chosenColor]))
        .classed("countryCircle", true);
    
    // Create the text for each circle
    elemEnter.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .classed("countryText", true)
        .text(d => d.country);
  
    // // updateToolTip for each scatter point
    updateToolTip(elemEnter);

    // function updates the chart's data point and features drop down
    function updateChart(ddType) {
        // Update features after new chosen
        updateFeatures();
        
        // Update Dropdowns and render chosen feature change
        if(ddType !== "xAxis") {
            // Refresh features in X-Axis
            let options = d3.select("#xAxisDD select").selectAll("option")
                .data(featuresXAxis);

            options.enter()
                .append("option")
                .merge(options)
                .attr("value", d => d)
                .property("selected", d => d === chosenXAxis)
                .text(d => d[0].toUpperCase() + d.slice(1,d.length));
            options.exit().remove();
        }
        else {
            // Update the chart data
            renderXAxis();
        };
        if(ddType !== "size") {
            let options = d3.select("#sizeDD select").selectAll("option")
                .data(featuresSize);

            options.enter()
                .append("option")
                .merge(options)
                .attr("value", d => d)
                .property("selected", d => d === chosenSize)
                .text(d => d[0].toUpperCase() + d.slice(1,d.length));
            options.exit().remove();
        }
        else {
            // Update the chart data
            renderSize();
        };
        if(ddType !== "color") {
            let options = d3.select("#colorDD select").selectAll("option")
                .data(featuresColor);

            options.enter()
                .append("option")
                .merge(options)
                .attr("value", d => d)
                .property("selected", d => d === chosenColor)
                .text(d => d[0].toUpperCase() + d.slice(1,d.length));
            options.exit().remove();
        }
        else {
            // Update the chart data
            renderColor();
        }
    }
    // Handler for dropdown value change
    let dropdownChangeXAxis = function() {
        // Update chosenXAxis to the new selected feature
        chosenXAxis = d3.select(this).property('value');
        // Update chart and dropdowns features
        updateChart("xAxis");
    };

    // Handler for dropdown value change
    let dropdownChangeColor = function() {
        // Update chosenXAxis to the new selected feature
        chosenColor = d3.select(this).property('value');
        // Update chart and dropdowns features
        updateChart("color");
    };
    
    // Handler for dropdown value change
    let dropdownChangeSize = function() {
        // Update chosenXAxis to the new selected feature
        chosenSize = d3.select(this).property('value');
        // Update chart and dropdowns features
        updateChart("size");
    };

    // Add select feature: x-axis
    let dropdownXAxis = d3.select("#xAxisDD")
                    .append("select")
                    .on("change", dropdownChangeXAxis);
    dropdownXAxis.selectAll("option")
        .data(featuresXAxis)
        .enter().append("option")
            .attr("value", d => d)
            .property("selected", d => d === chosenXAxis)
            .text(d => d[0].toUpperCase() + d.slice(1,d.length));
        
    // Add select feature: color
    let dropdownColor = d3.select("#colorDD")
                    .append("select")
                    .on("change", dropdownChangeColor);
    dropdownColor.selectAll("option")
        .data(featuresColor)
        .enter().append("option")
            .attr("value", d => d)
            .property("selected", d => d === chosenColor)
            .text(d => d[0].toUpperCase() + d.slice(1,d.length));

    // Add legend: color
    createColorLegend();

    // Add select feature: size
    let dropdownSize = d3.select("#sizeDD")
                    .append("select")
                    .on("change", dropdownChangeSize);
    dropdownSize.selectAll("option")
        .data(featuresSize)
        .enter().append("option")
            .attr("value", d => d)
            .property("selected", d => d === chosenSize)
            .text(d => d[0].toUpperCase() + d.slice(1,d.length));
    // Add legend: size
    createSizeLegend();
};

// Load data from API and then launch init() to create chart
d3.json("/api/v1.0/happinessdata").then(data => {
    console.log(data);
    // Load data into happinessData
    happinessMap = data;
    // Filter the happiness data by year and store into happinessData
    happinessData = happinessMap.filter(d => d.year === chosenYear);
    // Load factors into features
    updateFeatures();
    // Initialize scatter chart
    init();

    // function event handler for year change in drop down
    var dropdownChangeYear = function() {
        // update new chosen year
        chosenYear = parseInt(d3.select(this).property('value'));
        // Filter the happiness data by year and store into happinessData
        happinessData = happinessMap.filter(d => d.year === chosenYear);
        //Refresh chart & drop downs
        d3.select("#scatter").html("");
        d3.select("#xAxisDD").html("<span>X-Axis: </span>");
        d3.select("#colorDD").html("<span>Color: </span>");
        d3.select("#sizeDD").html("<span>Size: </span>");
        init();
    };
    // Add select years to year drop down
    let dropdownYear = d3.select("#yearDD")
                    .append("select")
                    .on("change", dropdownChangeYear);
    dropdownYear.selectAll("option")
        .data(years)
        .enter().append("option")
            .attr("value", d => d)
            .property("selected", d => d === chosenYear)
            .text(d => d);
});