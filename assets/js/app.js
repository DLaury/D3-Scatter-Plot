// Set up chart
var svgWidth = 850;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameter
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// Function updating x-scale variable on click
function xScale(correlationData, chosenXAxis) {
  // Create scales
  var xLinearScale = d3.scaleLinear()
    .domain([(d3.min(correlationData, d => d[chosenXAxis]) -.4),
      (d3.max(correlationData, d => d[chosenXAxis]) + .4)
    ])
    .range([0, width]);

  return xLinearScale;
}

// Function updating xAxis variable on click
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesText) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty: ";
  } else if (chosenXAxis === "age") {
    var label = "Age (Median): ";
  } else {
    var label = "Household Income: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([35, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesText.call(toolTip);

  circlesText.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesText;
}



// Import Data
d3.csv("assets/data/data.csv")
  .then(function(correlationData) {

    // Parse Data/Cast as numbers
    correlationData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Create scale functions
    var xLinearScale = xScale(correlationData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
      .domain([3.8, d3.max(correlationData, d => d.healthcare)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axes to the chart
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(correlationData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("class", "stateCircle");

    var circlesText = chartGroup.selectAll(".stateText")
        .data(correlationData)
        .enter()
        .append("text")
        .text((d) => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("class", "stateText")
        .attr("alignment-baseline", "central");

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 40})`);

    // Add additional x axis labels
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create tooltip variable
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([35, -60])
      .html(function(d) {
        return (`${d.state}<br>Poverty: ${d.poverty}`);
      });

    // Create tooltip in the chart
    circlesText.call(toolTip);
    
    // Create event listeners to display and hide the tooltip
    circlesText.on("mouseover", function(data) {
      toolTip.show(data, this)
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Healthcare (%)");
  });