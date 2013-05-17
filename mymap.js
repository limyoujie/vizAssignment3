var width = 960,
    height = 500;

var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 10]);

var path = d3.geo.path();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "us.json")
    .defer(d3.json, "us-state-centroids.json")
    .defer(d3.csv,"fakedata.csv")
    .await(ready);

function ready(error, us, centroid, circles) {
  svg.append("path")
      .attr("class", "states")
      .datum(topojson.feature(us, us.objects.states))
      .attr("d", path);

  svg.selectAll(".symbol")
      .data(centroid.features.sort(function(a, b) { return b.properties.population - a.properties.population; }))
    .enter().append("path")
      .attr("class", "symbol")
      .attr("d", path.pointRadius(function(d) { return radius(d.properties.population); }));
}
