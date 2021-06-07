// Cerate function for the event change
function optionChanged(pickID) {
    getidPlot(pickID);
    getidInfo(pickID);
};

// Create function to grab information from CSV file and create dropdown selection 
// Create link to chart functions
// function init(){
//     var dropdown = d3.select("#selDataset");
//     d3.csv("./assets/data/stroke_clean.csv").then((data) => {
//         console.log(data);

//         data[id].forEach(function(id){
//             dropdown.append("option").text(id).property("value");
//         });
        
//         getidPlot(id);
//         getidInfo(id);
//     });
// } 
// init();

// Bar chart
  // set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 90, left: 40},
width = 460 - margin.left - margin.right,
height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("./assets/data/insurance_clean.csv", function(data) {
    console.log(data)

// X axis
var x = d3.scaleLinear()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.age; }))
    .padding(0.2);
svg.append("g")
    attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 13000])
    .range([ height, 0]);
svg.append("g")
    .call(d3.axisLeft(y));

// Bars
svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.age); })
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
// no bar at the beginning thus:
    .attr("height", function(d) { return height - y(0); }) // always equal to 0
    .attr("y", function(d) { return y(0); })

// Animation
svg.selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", function(d) { return y(d.charges); })
    .attr("height", function(d) { return height - y(d.charges); })
    .delay(function(d,i){console.log(i) ; return(i*100)})
})
// Fill in Demographic Information on chart and Create Gauge
function getidInfo(id) {
    d3.csv("./assets/data/stroke_clean.csv").then((data) => {
        var metadata = data.metadata;
 
        var results = metadata.filter(meta => meta.id.toString() === id)[0];
        var demoInfo = d3.select("#sample-metadata");
        demoInfo.html("");
        Object.entries(results).forEach((key) => {
            demoInfo.append("p").text(key[0] + ": " + key[1]);
        var wfreq = results.wfreq;
        console.log(wfreq);

// Gauge Chart
    var data2 = [
        {
        domain: { x: [0,1], y: [0,1]},
        value: wfreq,
        title: {text: "<b>Belly Button Washing Frequency </b><br> (Scrubs per Week)"},
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: {range: [null, 9]},
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                {range: [0,1], color: "rgb(248, 243, 236)"},
                {range: [1,2], color: "rgb(238, 239, 228)"},
                {range: [2,3], color: "rgb(233, 230, 202)"},
                {range: [3,4], color: "rgb(218, 231, 179)"},
                {range: [4,5], color: "rgb(213, 228, 157)"},
                {range: [5,6], color: "rgb(183, 204, 146)"},
                {range: [6,7], color: "rgb(140, 191, 136)"},
                {range: [7,8], color: "rgb(138, 187, 143)"},
                {range: [8,9], color: "rgb(133, 180, 138)"},
            ],
        }
    }];

    var layout2 = {
        width: 525,
        height: 400,
        margin: {t: 0, b: 0, l: 100, r:100}
    };

    Plotly.newPlot("gauge", data2, layout2, {responsive: true});
    });
    });
};

    