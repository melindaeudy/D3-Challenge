// ===============Responsive Function 
d3.select(window).on("resize", handleResize);

// When the browser loads, loadChart() is called
loadChart();

function handleResize() {
  var svgArea = d3.select("svg");

  // If there is already an svg container on the page, remove it and reload the chart
  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  }
}

function loadChart() {
    // ===========Set Height, Width and Margins
    var svgHeight = 600;
    var svgWidth = 960;
    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };
    
    // ===========Create chart area
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // ******Test that the settings are working******
    console.log("Height: ", height);
    console.log("Width: ", width);

    //============Create SVG container
    var svg = d3.select("#scatter").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight + 30);

    // ===========Append SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ============================================================================
    // ===========Functions =======================================================
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // ==========xScale and yScale
    function xScale(StateData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(StateData, d => d[chosenXAxis]),
                d3.max(StateData, d => d[chosenXAxis]) 
            ])
            .range([0, width]); 

        return xLinearScale;
    }

    function yScale(StateData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(StateData, d => d[chosenYAxis])
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // updating xAxis  and yAxis variable upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
  
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
  
        return xAxis;
    }

    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
  
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
  
        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles on X and Y axis
    function renderXCircles(circleGroup, newXScale, chosenXAxis) {
        circleGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));
  
        return circleGroup;
    }

    function renderYCircles(circleGroup, newYScale, chosenYAxis) {
        circleGroup.transition()
            .duration(1000)
            .attr("cy", d => newYScale(d[chosenYAxis]));
  
        return circleGroup;
    }

    
     // ==========Text  for circles   
     function renderXText(circleGroup, newXScale, chosenXAxis) {
        circleGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    
        return circleGroup;
    }
    
    function renderYText(circleGroup, newYScale, chosenYAxis) {
        circleGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));
    
        return circleGroup;
    }

    // =================Update Tooltips - labels and tip
    function updateToolTip(circleGroup, chosenXAxis, chosenYAxis) {
        var xlabel = "";
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty(%): ";
        }
        else if (chosenXAxis === "age") {
            xlabel = "Age (median): ";
        }
        else {
            xlabel = "Income(median): $ ";   
        }

        var ylabel = "";
        if(chosenYAxis === "obesity") {
            ylabel = "Obesity(%): ";
        }
        else if (chosenYAxis === "healthcareLow") {
            ylabel = "Healthcare(%): ";
        }
        else {
            ylabel = "Smokes(%): "
        }

        // ==============Update tool function
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return(`${d.state}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`)
            });

        circleGroup.call(toolTip);

        circleGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
        })
            .on("mouseout", function(d) {
                toolTip.hide(d);
            });

        return circleGroup;
    }

    // =================================================================================
    // ===============Retrieving data & Parse data======================================
    d3.csv("./assets/data/data.csv").then(function(StateData, err) {
        if (err) throw err;

        StateData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcareLow = +data.healthcareLow;
        });

        // ******Testing StateData loaded******
        console.log("StateData: ", StateData);

        // Repeat Linear functions from above retrieval
        var xLinearScale = xScale(StateData, chosenXAxis);
        var yLinearScale = yScale(StateData, chosenYAxis);
       

         // ==========Create Axis
         var bottomAxis = d3.axisBottom(xLinearScale);
         var leftAxis = d3.axisLeft(yLinearScale);

        // =============Append x and y plus the circles (scatterplot)
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // ===========Circles created on chart

        var circleGroup = chartGroup.selectAll("g circle")
            .data(StateData)
            .enter()
            .append("g");
        
        var placeCircle = circleGroup.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "orange")
            .attr("opacity", ".5")
                
        // =============Add labels circles (scatterplot)
        var circleText = circleGroup.append("text")
            .text(d => d.abbr)
            .attr("dx", d => xLinearScale(d[chosenXAxis]))
            .attr("dy", d=> yLinearScale(d[chosenYAxis]))
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        // Creat group for three x-axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertylabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Poverty (%)");
        
        var agelabel = labelsGroup.append("text")
            .attr("x",0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text(" Age (median)");
        
        var incomelabel = labelsGroup.append("text")
            .attr("x",0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text(" Household Income (median)");

        // Create group for three y-axis labels
        var ylabelsGroup = chartGroup.append("g");

        var obesitylabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity")
            .classed("active", true)
            .text("Obesity (%)");
        
        var healthcarelabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcareLow")
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");
        
        var smokeslabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -80)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var circleGroup = updateToolTip(circleGroup, chosenXAxis, chosenYAxis);

        //x axis labels event listener
        labelsGroup.selectAll("text").on("click", function() {
            var value = d3.select(this).attr("value");

            if (value !== chosenXAxis) {
            chosenXAxis = value;
            }

            xLinearScale = xScale(StateData, chosenXAxis);
            xAxis = renderXAxes(xLinearScale, xAxis);
            placeCircle = renderXCircles(placeCircle, xLinearScale, chosenXAxis);
            circleText = renderXText(circleText, xLinearScale, chosenXAxis);
            circleGroup = updateToolTip(circleGroup, chosenXAxis, chosenYAxis);

            //Changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertylabel
                    .classed("active", true)
                    .classed("inactive", false);
                agelabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomelabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            else if (chosenXAxis === "income") {
                povertylabel
                    .classed("active", false)
                    .classed("inactive", true);
                agelabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomelabel
                    .classed("active", true)
                    .classed("inactive", false); 
                }
            else {
                povertylabel
                    .classed("active", false)
                    .classed("inactive", true);
                agelabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomelabel
                    .classed("active", false)
                    .classed("inactive", true); 
                }
        })
        // y axis labels event listener
        ylabelsGroup.selectAll("text").on("click", function() {
            var value = d3.select(this).attr("value");

            if (value !== chosenYAxis) {
                    chosenYAxis = value;
            }

            yLinearScale = yScale(StateData, chosenYAxis);
            yAxis = renderYAxes(yLinearScale, yAxis);
            placeCircle = renderYCircles(placeCircle, yLinearScale, chosenYAxis);
            circleText = renderYText(circleText, yLinearScale, chosenYAxis);
            circleGroup = updateToolTip(circleGroup, chosenXAxis, chosenYAxis);

             //Changes classes to change bold text
             if (chosenYAxis === "obesity") {
                obesitylabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcarelabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeslabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            else if (chosenYAxis === "smokes") {
                obesitylabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcarelabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeslabel
                    .classed("active", true)
                    .classed("inactive", false); 
                }
            else {
                obesitylabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcarelabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeslabel
                    .classed("active", false)
                    .classed("inactive", true); 
                }
            })
        }).catch(function(error) {
            console.log(error);
    }); 
}
