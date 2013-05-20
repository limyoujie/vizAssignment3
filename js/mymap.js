var active;

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 960,
    outerHeight = 500,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

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


queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/fakedata.csv")
    .await(ready);

function ready(error, us, circles) {

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

  g.selectAll("circle")
      .data(circles)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return projection([d.y,d.x])[0]*Math.random()*3})
      .attr("cy", function(d) { return projection([d.y,d.x])[1]*Math.random()-100})
      .attr("r", function(d) { return d.Attribute1/2})
      .style("fill", "blue")
      .style("stroke", "red")
      .style("stroke-width",4)
      .transition()
      .duration(300)
      .attr("cx", function(d) { return projection([d.y,d.x])[0]})
      .attr("cy", function(d) { return projection([d.y,d.x])[1]})
      .attr("r", function(d){ return d.Attribute1/4})
      .style("stroke","black")
      .style("stroke-width",1);

}

function click(d) {
  if (active === d) return reset();
  g.selectAll(".active").classed("active", false);
  d3.select(this).classed("active", active = d);

  var b = path.bounds(d);
  g.transition().duration(750).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
  g.selectAll(".active").classed("active", active = false);
  g.transition().duration(750).attr("transform", "");
}