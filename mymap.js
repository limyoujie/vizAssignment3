var width = 960,
    height = 500;

var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 10]);

var path = d3.geo.path();

var svg = d3.select(#map).append("svg")
    .attr("width", width)
    .attr("height", height);


  svg.selectAll(".symbol")
      .data(centroid.features.sort(function(a, b) { return b.properties.population - a.properties.population; }))
    .enter().append("path")
      .attr("class", "symbol")
      .attr("d", path.pointRadius(function(d) { return radius(d.properties.population); }));
}

	group1.transition()
	.duration(1000)
	.ease('bounce')
	.attr("transform", "scale(" + k + ")translate(" + x + width/2 + "," + y + ")")
	.style("stroke-width", 1.5 / k + "px");
}

