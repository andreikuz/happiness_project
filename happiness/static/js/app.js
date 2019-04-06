/**
 * D3 Add cards for each column of data covered in Happiness
 */

 // Will add this to be loaded from API
var happinessData = [
    {
        title: "Suicide",
        desc: "blah blah"
    },
    {
        title: "GPI Score",
        desc: "blah blah"
    },
    {
        title: "Life Ladder",
        desc: "blah blah"
    },
    {
        title: "GDP per Capita",
        desc: "blah blah"
    },
    {
        title: "Freedom",
        desc: "Freedom to make life choices"
    },
    {
        title: "Generosity",
        desc: "blah blah"
    },
    {
        title: "Confidence",
        desc: "Confidence in national government"
    },
    {
        title: "Years",
        desc: "blah blah"
    }
];

/**
 * Create the card for each happniessData
 */
var factors = d3.select("#factors");
happinessData.forEach( e => {
    // Append Card
     var card = factors.append("div").classed("col-xs-12 col-md-3", true)
        .append("div").classed("card border-danger mb-3", true).attr("style", "max-width: 20rem; min-height: 15rem;")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
    card.append("div").classed("card-header", true).text(`${e.title}`);
    card.append("div").classed("card-body", true)
        .append("p").classed("card-text", true).text(e.desc);
        
});

/**
 * function hover over and out: change the card background colors
 */
function handleMouseOver()
{
    d3.select(this).classed("text-white bg-warning", true);
    d3.select(this).classed("border-danger", false);
};
function handleMouseOut() {
    d3.select(this).classed("border-danger", true);
    d3.select(this).classed("text-white bg-warning", false);
};

d3.json("/api/v1.0/factors").then(data => {
    console.log(data);
});