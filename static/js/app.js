
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
        chart.append("p").text(`${key} : ${value}`);
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