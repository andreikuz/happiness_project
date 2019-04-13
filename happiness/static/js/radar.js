//var dataMap = null;
// create rank data
var rankData = []; // Load in d3.json
var countries = []; // Load in d3.json
var years = [2011, 2012, 2013, 2014, 2015];
var country = "United States of America";
var year = 2015;
// labels and values array for radar chart data
var labels = ['Suicide Rate',
              'Global Peace Index',
              'Happiness',
              'Gross Domestic Product',
              'Freedom',
              'Generosity',
              'Trust in Government'];
var values = [];

function filterData() {
  // reset values arrays
  labels = [];
  values = [];
  // filter data from the chosen year, country
  function selectFilter(rowData) {
    var result = (rowData.country === country) && (rowData.year === year) ; 
    return result};

  var filteredData = rankData.filter(selectFilter);
  // Update labels and values from filtered Data
  Object.entries(filteredData[0]).forEach(([key, value])=>{
    // add values and labels into their arrays if not country, year
    if((key != "country") && (key != "year")){
        labels.push(key);
        values.push(value);
    }
  });
};

function createDropDown() {
  var ddDiv = d3.select("#dropdown");
  
  // function on years dropdown change
  var dropDownChangeYear = function() {
    // update selected year
    year = parseInt(d3.select(this).property("value"));
    //update filter data
    filterData();
    //update chart
    createChart();
  };
  var yearSelect = ddDiv.append("select")
    .classed("custom-select", true)
    .on("change", dropDownChangeYear);
  years.forEach(d => {
    var select = yearSelect.append("option")
      .attr("value", d)
      .text(d);
    if (d === year)
      select.attr("selected", ""); 
  });
  
  // function on country dropdown change
  var dropDownChangeCountry = function() {
    //update selected country
    country = d3.select(this).property("value");
    //update filter data
    filterData();
    // update chart
    createChart();
  }
  // load countries dropdown
  var dd2div = d3.select("#dropdown2");
  var countrySelect = dd2div.append("select")
    .classed("custom-select", true)
    .on("change", dropDownChangeCountry);
  countries.forEach(d => {
    var select = countrySelect.append("option")
      .attr("value", d)
      .text(d);
    if (d === country) 
      select.attr("selected", "");
  });
}

function createChart() {
  // Create radar chart
  new Chart(document.getElementById("radar"), {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `${country} ${year}`,
            fill: true,
            backgroundColor: "rgba(179,181,198,0.2)",
            borderColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointBackgroundColor: "rgba(179,181,198,1)",
            data: values
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Factors that effect happiness'
        }
      }
  });
};

d3.json('/api/v1.0/happinessdata').then(data => {
  // save data
  dataMap = data;
  // Load country names into countries array
  data.forEach((d)=>{
    countries.push(d.country);
  });
  // create distinct country array
  countries = [...new Set(countries.map(d=>d))].sort();
  // Create Drop downs
  createDropDown();
  
  // loop through years
  years.forEach(y => {
    // Initialize zeros data by country and year
    countries.forEach(c => {
      // add data into rankData
      rankData.push({
        'country': c,
        'year': y
      })
    });

    // filter data by year
    function yearFilter(rowData) {
      return (rowData.year === y);
    };
    // filter data by year
    var yearData = dataMap.filter(yearFilter);
    // Sort rank by Suicide Rate & assign rank value
    labels.forEach(l => {
      freedomRank = yearData.sort((a, b) => parseFloat(b[l]) - parseFloat(a[l]));
      freedomRank.forEach((d,i) => {
        // Update freedom rank within rankData
        rankData.forEach(r => {
          if((r.country === d.country) &&(r.year === d.year)) {
            if(d === null)
              r[l] = 0;
            else
              r[l] = countries.length - i;
          }
        });
      });
    });

  });

  // create inital chart
  filterData();
  createChart();
})