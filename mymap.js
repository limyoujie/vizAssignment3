var width = 960,
    height = 500;

var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 10]);

var albers = d3.geo.albersUsa()
.scale(875);

var path = d3.geo.path().projection(albers);

var svg = d3.select("#main").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "fakedata.csv")
    .await(ready);

function ready(error, us, circles) {


  svg.append("path")
      .attr("class", "states")
      .datum(topojson.feature(us, us.objects.states))
      .attr("d", path);

  svg.selectAll("circle")
      .data(circles)
    .enter().append("circle")
      .attr("cx", function(d) { return albers([d.y,d.x])[0]*Math.random()*3})
      .attr("cy", function(d) { return albers([d.y,d.x])[1]*Math.random()-100})
      .attr("r", function(d) { return d.Attribute1/2})
      .style("fill", "transparent")
      .style("stroke", "red")
      .style("stroke-width",4)
      .transition()
      .duration(300)
      .attr("cx", function(d) { return albers([d.y,d.x])[0]})
      .attr("cy", function(d) { return albers([d.y,d.x])[1]})
      .attr("r", function(d){ return d.Attribute1/4})
      .style("stroke","black")
      .style("stroke-width",1);

}
