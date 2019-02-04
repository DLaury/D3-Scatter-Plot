// Set up chart
var svgWidth = 1000;
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
var chosenYAxis = "healthcare";

// Function updating x-scale variable on click
function xScale(correlationData, chosenXAxis) {
  // Create scales accounting for the offset of the larger scale difference needed for income
  if (chosenXAxis === "income") {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(correlationData, d => d[chosenXAxis]) - 1000,
      d3.max(correlationData, d => d[chosenXAxis]) + 1000])
    .range([0, width]);
  } else {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(correlationData, d => d[chosenXAxis])- .4,
        d3.max(correlationData, d => d[chosenXAxis]) + .4])
      .range([0, width]);
  }
  return xLinearScale;
}

// Function updating y-scale variable on click
function yScale(correlationData, chosenYAxis) {
  // Create scales accounting for the offset of the larger scale difference needed for income
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(correlationData, d => d[chosenYAxis]),
      d3.min(correlationData, d => d[chosenYAxis] - 1)])
    .range([0, height]);
  return yLinearScale;
}

// Function updating xAxis variable on click
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function updating yAxis variable on click
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  
  return circlesGroup;
}

function renderTextX(textGroup, newXScale, chosenXAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  
  return textGroup;
}

function renderTextY(textGroup, newYScale, chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {

//   if (chosenXAxis === "poverty") {
//     var label = "Poverty: ";
//   } else if (chosenXAxis === "age") {
//     var label = "Age (Median): ";
//   } else {
//     var label = "Household Income: "
//   };

//   var toolTip = d3.tip()
//     .attr("class", "d3-tip")
//     .offset([35, -60])
//     .html(function(d) {
//       return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
//     });

//   circlesGroup.call(toolTip);

//   circlesGroup.on("mouseover", function(data) {
//     toolTip.show(data);
//   })
//     // on mouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   return circlesGroup;



// Possibly try to update x placement 



// }

// Import Data
d3.csv("assets/data/data.csv")
  .then(function(correlationData) {

    // Parse Data/Cast as numbers
    correlationData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

    // Create scale functions
    var xLinearScale = xScale(correlationData, chosenXAxis);

    var yLinearScale = yScale(correlationData, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis to the chart
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // Append y-axis to the chart
    var yAxis = chartGroup.append("g")
      .attr("transform", `translate(${margin.right-40}, 0)`)
      .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(correlationData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("class", "stateCircle");

    var textGroup = circlesGroup.select(".stateText")
        .data(correlationData)
        .enter()
        .append("text")
        .text((d) => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("class", "stateText")
        .attr("alignment-baseline", "central");

    // Create group for  3 x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 40})`);
    
    // Create group for 3 y-axis labels
    var verticalLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${-margin.right}, ${height/2})`);

    // Add additional y-axis labels
    var healthcareLabel = verticalLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0)
      .classed("active", true)
      .attr("value", "healthcare")
      .text("Healthcare (%)");
    
    var smokesLabel = verticalLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -20)
      .attr("x", 0)
      .classed("inactive", true)
      .attr("value", "smokes")
      .text("Smokes (%)");

    var obesityLabel = verticalLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", 0)
      .classed("inactive", true)
      .attr("value", "obesity")
      .text("Obesity (%)");

    // Add additional x-axis labels
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

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // // Create tooltip variable
    // var toolTip = d3.tip()
    //   .attr("class", "d3-tip")
    //   .offset([35, -60])
    //   .html(function(d) {
    //     return (`${d.state}<br>Poverty: ${d.poverty}`);
    //   });

    // // Create tooltip in the chart
    // circlesText.call(toolTip);
    
    // // Create event listeners to display and hide the tooltip
    // circlesText.on("mouseover", function(data) {
    //   toolTip.show(data, this)
    // })
    //   // onmouseout event
    //   .on("mouseout", function(data, index) {
    //     toolTip.hide(data);
    //   });

    // Listen for clicks on x-axis and act upon it
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(correlationData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
          textGroup = renderTextX(textGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false)
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true)
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true)
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      verticalLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenYAxis with value
          chosenYAxis = value;

          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(correlationData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new y values
          circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
          textGroup = renderTextY(textGroup, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          // circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false)
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true)
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          } else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true)
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });