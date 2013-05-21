

// Ratio of Obese (BMI >= 30) in U.S. Adults, CDC 2008
var valueById = [
   NaN, .187, .198,  NaN, .133, .175, .151,  NaN, .100, .125,
  .171,  NaN, .172, .133,  NaN, .108, .142, .167, .201, .175,
  .159, .169, .177, .11, .163, .117, .182, .153, .195, .189,
  .134, .163, .133, .151, .145, .130, .139, .169, .164, .175,
  .135, .152, .169,  NaN, .132, .167, .139, .184, .159, .140,
  .146, .157,  NaN, .139, .183, .160, .143
];

var color = d3.scale.linear()
              .domain([0, d3.max(valueById)])
              .range(["blue", "purple"]);

var margin1 = {top: -50, right: 0, bottom: 0, left: 0},
    width1 = 900 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom,
    padding = 3;

var projection1  = d3.geo.albersUsa();

var radius = d3.scale.sqrt()
    .domain([0, d3.max(valueById)])
    .range([0, 35]);

var force = d3.layout.force()
    .charge(50)
    .gravity(0)
    .size([width1, height1]);

var svg1 = d3.select("#mymap2").append("svg")
    .attr("width", width1)
    .attr("height", height1);

d3.json("data/us-state-centroids1.json", function(error, states) {
  var nodes = states.features
      .filter(function(d) { return !isNaN(valueById[+d.id]); })
      .map(function(d) {
        var point = projection1(d.geometry.coordinates),
            value = valueById[+d.id];
            namestate = d.properties.abb;
        if (isNaN(value)) fail();
        return {
          x: point[0]-120, y: point[1],
          x0: point[0]-120, y0: point[1],
          r: radius(value),
          value: value, name: namestate
        };
      });

  force
      .nodes(nodes)
      .on("tick", tick)
      .start();

  var node = svg1.selectAll(".feature")
      .data(nodes)
      .enter().append("g")
      .call(force.drag);

    // node.append("image")
    //   .attr("xlink:href", "happycrab.gif")
    //   .attr("x", -8)
    //   .attr("y", -8)
    //   .attr("width", function(d) { return d.r * 2; })
    //   .attr("height", function(d) { return d.r * 2; })

    node.append("rect")
      .attr("class", "squares")
      .attr("width", function(d) { return d.r * 2; })
      .attr("height", function(d) { return d.r * 2; })
      //.style("fill-opacity", 0.5)
      .style("fill", function(d) { return color(d.value); });

    // node.append("rect")
    //   .attr("class", "squares")
    //   .attr("x", function(d) { return d.r/1.8;})
    //   .attr("y", function(d) { return d.r;})
    //   .attr("width", function(d) { return d.r * .8; })
    //   .attr("height", function(d) { return d.r * .8; })
    //   .style("fill-opacity", 0.5)
    //   .style("fill", function(d) { return color(d.value/4); });

    node.append("text")
      .attr("dx", function(d) { return d.r/1.8;})
      .attr("dy", function(d) { return d.r;})
      .text(function(d) { return d.name; })
      .style("font-size", function(d) {return d.value * 150;})
      .style("fill", "white");


  function tick(e) {
    node.each(gravity(e.alpha * .1))
        .each(collide(.5));
    node.attr("transform", function(d) { return "translate(" + (d.x ) + "," + (d.y) + ")"; });
  }

  function gravity(k) {
    return function(d) {
      d.x += (d.x0 - d.x) * k;
      d.y += (d.y0 - d.y) * k;
    };
  }

  function collide(k) {
    var q = d3.geom.quadtree(nodes);
    return function(node) {
      var nr = node.r + padding,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
      q.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              lx = Math.abs(x),
              ly = Math.abs(y),
              r = nr + quad.point.r;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -k : k);
              node.x -= lx;
              quad.point.x += lx;
            } else {
              ly = (ly - r) * (y < 0 ? -k : k);
              node.y -= ly;
              quad.point.y += ly;
            }
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
});

