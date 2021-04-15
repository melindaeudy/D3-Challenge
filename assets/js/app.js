// Responsive Function - Sets Height, Width, Margins
function makeResponsive() {
    var svgArea = d3.select("body").select("svg");
    if(!svgArea.empty()) {
        svgArea.remove();
    }

    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;
    var margin = {
        top:50,
        right:50,
        bottom:50,
        left:50
    };

    // Create chart area
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    console.log("Height: ", height);
    console.log("Width: ", width);

    // Create SVG container
    var svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Updating and scaling for size x Axis
    var chosenXAxis = "poverty";

    function xScale(StateData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(StateData, d => d[chosenXAxis]) * .08,
                d3.max(StateData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]); 

    return xLinearScale;
    };

    console.log("ChosenXAxis: ", chosenXAxis);
    //console.log("xLinearScale: ", xLinearScale);

    // Update X axis label on click
    function renderAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call (bottomAxis);  

        return xAxis;
    };

    // Circles
    function renderCircles(circleGroup, nextXScale, chosenXAxis) {
        circleGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));

        return circleGroup;
    };

    // Tooltips on circleGoup - labels
    function updateToolTip(chosenXAxis, circleGoup) {
        var label;
        if (chosenXAxis === "poverty") {
            label = "In Poverty (%): ";
        }
        else {
            if (chosenXAxis === "age") {
                label = "Age (median): ";
            }
            else (chosenXAxis === "income") 
                label = "Household Income (median): ";   
        };

        // Update tool function
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function() {
                return (`${d.state}<hr>${label}${d[chosenXAxis]}`);
            });

        circleGoup.call(toolTip);

        circleGoup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
        return circleGoup;
    };

    // Retrieving data & Parse data
    d3.csv("./assets/data/data.csv").then(function(StateData, err) {
        if (err) throw err;

        StateData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcarelow = +data.healthcarelow;
        });

        console.log(StateData);

        var xLinearScale = xScale(StateData, chosenXAxis);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(StateData, d => d.obesity)])
            .range([height, 0]);

        var bottomAxis = d3.axisBottom(xLinearScale);

        var leftAxis = d3.axisLeft(yLinearScale);

        // Append x and y plus the circles
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        var circleGoup = chartGroup.selectAll("circle")
            .data(StateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.obesity))
            .attr("r", 20)
            .attr("fill", "green")
            .attr("opacity", ".5");

        // Creat group for three x-axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var poverty = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Poverty (%)");

        var age = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "age")
            .classed("active", true)
            .text("Age (median)");
        
        var income = labelsGroup.append("text")
            .attr("x",0)
            .attr("y", 20)
            .attr("value", "income")
            .classed("active", true)
            .text(" Household Income (median)");

        // Append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "lem")
            .classed("axis-text", true)
            .text("Obesity (%)");

        var circleGoup = updateToolTip(chosenXAxis, circleGoup);

        //x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    console.log(chosenXAxis);
                    xLinearScale = xScale(StateData, chosenXAxis);
                    xAxis = renderAxis(xLinearScale, xAxis);
                    circleGoup = renderCircles(circleGoup, xLinearScale, chosenXAxis);
                    circleGoup = updateToolTip(chosenXAxis, circleGoup);

                    //Changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        poverty
                            .classed("active", true)
                            .classed("inactive", false);
                        age
                            .classed("active", false)
                            .classed("inactive", true);
                        income
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenXAxis === "age") {
                        poverty
                            .classed("active", false)
                            .classed("inactive", true);
                        age
                            .classed("active", true)
                            .classed("inactive", false);
                        income
                            .classed("active", false)
                            .classed("inactive", true); 
                        }
                    else {
                        poverty
                            .classed("active", false)
                            .classed("inactive", true);
                        age
                            .classed("active", false)
                            .classed("inactive", true);
                        income
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
        console.log(error);
    });
};

makeResponsive();

d3.select(window).on("resize", makeResponsive);

