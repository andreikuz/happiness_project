/**
 * D3 Add cards for each column of data covered in Happiness
 */

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

/**
 * Create the card for each happniessData
 */
    var factors = d3.select("#factors");
    data.forEach( e => {
    // Append Card
     var card = factors.append("div").classed("col-xs-12 col-md-3", true)
        .append("div").classed("card border-danger mb-3", true).attr("style", "max-width: 20rem; min-height: 15rem;")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
    card.append("div").classed("card-header", true).text(`${e.title}`);
    card.append("div").classed("card-body", true)
        .append("p").classed("card-text", true).text(e.desc);
        
    });
});