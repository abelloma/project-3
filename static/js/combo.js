

// start here for previous working version
var svgWidth = 800;
var svgHeight = 445;

var margin = {
  top: 30,
  right: 40,
  bottom: 70,
  left: 60
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(beerData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(beerData, d => d[chosenXAxis]) * 0.8,
      d3.max(beerData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderText(txtGroup, newXScale, chosenXaxis) {

  txtGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return txtGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "income") {
    var label = "Income:";
  }
  else if (chosenXAxis === "wineries") {
    var label = "Wineries:";
  }
  else {
    var label = "Population:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state} <br> Breweries: ${d.brewery_count}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("combined_data.csv").then(function(beerData, err) {
  if (err) throw err;

  // parse data
  beerData.forEach(function(data) {
    data.income = +data.income;
    data.wineries = +data.wineries;
    data.population = +data.population;
    data.brewery_count = +data.brewery_count;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(beerData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([-50, d3.max(beerData, d => d.brewery_count)+120])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  var circles = chartGroup.selectAll("g circle")
    .data(beerData)
    .enter()
    .append("g");

  // append initial circles
  var circlesGroup = circles.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.brewery_count))
    .attr("r", 20)
    .classed("stateCircle", true)
    .attr("opacity", ".8");
    
  var txtGroup = circles.append("text")
    .text(d => d.abbr)
    .style("font-size", "10px")
    .attr("x", d=>xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.brewery_count))  
    .classed("stateText", true)  
    .style("font-weight", "800")

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income (Median)");

  var populationLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "population") // value to grab for event listener
    .classed("inactive", true)
    .text("Population");

    // var wineryLabel = labelsGroup.append("text")
    // .attr("x", 0)
    // .attr("y", 60)
    // .attr("value", "wineries") // value to grab for event listener
    // .classed("inactive", true)
    // .text("Wineries");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    .text("Brewery Count by State");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(beerData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        txtGroup = renderText(txtGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "population") {
          populationLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          // wineryLabel
          //   .classed("active", false)
          //   .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          populationLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          // wineryLabel
          //   .classed("active", false)
          //   .classed("inactive", true);
        }
        else {
          populationLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        //   wineryLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});



function buildMetadata(state) {

    // console.log("state")
    // console.log(state)
    
  d3.json("states.json").then((data) => {
      // console.log("data")
      // console.log(data) 
      var filteredData = data.states.filter(s=> s.state.toString() === state)[0];
      // console.log("filtered")
      // console.log(filteredData)
      var chart = d3.select("#sample-metadata")
      chart.html("")
     
      Object.entries(filteredData).forEach(([key, value]) => {
        console.log(key)
        switch (key) {
          case "state":
            chart.append("p").text(`State : ${value}`);
            break;
          case "income":
            chart.append("p").text(`Avg Income : $${value}`);
            break;
          case "brewery_count":
            chart.append("p").text(`Breweries : ${value}`);
            break;
          case "population":
            chart.append("p").text(`Population : ${value}`);
            break;
          case "pct_brewery":
            chart.append("p").text(`% of Total Breweries in US: ${parseFloat(value).toFixed(2)}%`);
            break;
        }
      // chart.append("p").text(`${key} : ${value}`);
      });
    });

};

function init() {
    
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
    
    // Use the list of state names to populate the select options
    d3.json("states.json").then((data) => {

      var stateNames = data.states

      var firstState = data.states[0].state
      console.log(firstState)

      buildMetadata(firstState);
      // console.log("first")
      // console.log(firstState)
    
      stateNames.forEach((item) => {
        selector
          .append("option")
          .text(item.state)
          .property("value", item.state);
        });
    });
  }
  
  function optionChanged(newState) {
    // Fetch new data each time a new sample is selected
    // buildCharts(newState);
    // console.log(newState)
    buildMetadata(newState);
  }
  
  // Initialize the dashboard

  init();