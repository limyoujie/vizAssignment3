
var active;

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 960,
    outerHeight = 400,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;

var projection = d3.geo.albersUsa()
    .scale(900)
    .translate([width / 1.8, height / 1.2]);

var path = d3.geo.path()
    .projection(projection);    

var svg = d3.select("#mymap").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

var height2 = 200;
var svg2 = d3.select("#mybar").append("svg")
    .attr("width", 1000)
    .attr("height", height2)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/fakedata.csv")
    .await(ready);

function ready(error, us, data) {

  g.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "feature")
      .on("click", click);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

  var xScale = d3.scale.ordinal()
                .domain(d3.range(data.length))
                .rangeRoundBands([0, 1000], 0.05);

  svg2.selectAll("rect")
   .data(data)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
    return xScale(i);
    console.log(xScale(i));
})
   .attr("y", function(d) {
    return height2 - (d.Attribute1 * 1.5);  //Height minus data value
})
   .attr("width", xScale.rangeBand())
   .attr("height", function(d) {
    return (d.Attribute1 * 1.5);  //Just the data value
})
   .style("fill", function(d) {
    return "rgb(" + Math.round(d.Attribute1 * 2.2) + ", " + Math.round(d.Attribute1 * 2.6) + ", " + Math.round(d.Attribute1 * 1.1) + ")";
});

  svg2.selectAll("rect")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i);
           });

  svg2.selectAll("text")
   .data(data)
   .enter()
   .append("text")
   .text(function(d) {
        return Math.round(d.Attribute1);
   })
   .attr("x", function(d, i) {
        return xScale(i) + 9;
    })
   .attr("y", function(d) {
        return height2 - (d.Attribute1 * 1.5) - 5;             
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "11px")
   .attr("fill", "black")
   .attr("text-anchor", "middle");

  svg2.selectAll("text")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i) + xScale.rangeBand() / 2;
           });  

}

function click(d) {
  if (active === d) return reset();
  g.selectAll(".active").classed("active", false);
  d3.select(this).classed("active", active = d);

  var b = path.bounds(d);
  g.transition().duration(750).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
  g.selectAll(".active").classed("active", active = false);
  g.transition().duration(750).attr("transform", "");
}

var sortBars = function() {

        svg.selectAll("rect")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i);
           });

         svg.selectAll("text")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i) + xScale.rangeBand() / 2;
           });  

};