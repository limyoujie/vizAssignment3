var color = d3.scale.linear()
              .domain([0, 10])
              .range(["blue", "purple"]);

var margin = {top: -20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 450,
    outerHeight = 300,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom; /////MINIMAP

var projection1 = d3.geo.albersUsa()
    .scale(475)
    .translate([width / 1.1, height / 1]);///MINIMAP

var projection  = d3.geo.albersUsa();////MAINMAP

var margin1 = {top: -50, right: 0, bottom: 0, left: 0},
    width1 = 900 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom,
    padding = 3;////MAINMAP

var path = d3.geo.path()
    .projection(projection1);

var radius = d3.scale.sqrt()
    .domain([0, 10])
    .range([0, 35]);

var force = d3.layout.force()
    .charge(10)
    .gravity(0)
    .size([width1, height1]);

var svg = d3.select("#mymap").append("svg")
    .attr("width", "100%")
    .attr("height", "50%")
    .attr("viewBox", "0 0 600 500")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");//MINIMAP

var svg1 = d3.select("#mymap2").append("svg")
    .attr("width", "100%")
    .attr("height", "75%")
    .attr("viewBox", "0 0 900 700");//MAIN MAP

queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/fakedata.csv")
    .defer(d3.json, "data/us-state-centroids1.json")
    .await(ready);    

function ready(error, us, fakedata, states) {
  var nodes = states.features
      .map(function(d) {
        var point = projection(d.geometry.coordinates),
            abb = d.id;
            namestate = d.properties.abb;
            ATT = d.properties.ATT;

        return {
          x: point[0]-120, y: point[1]+50,
          x0: point[0]-120, y0: point[1]+50,
          r: radius(ATT), name: namestate,
          att: ATT
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
    //   .attr("xlink:href", "cell.gif")
    //   .attr("x", -8)
    //   .attr("y", -8)
    //   .attr("width", function(d) { return d.r * 2; })
    //   .attr("height", function(d) { return d.r * 2; })

    node.append("rect")
      .attr("class", function(d) { return d.name + ' squares';})
      .attr("width", function(d) { return d.r * 2; })
      .attr("height", function(d) { return d.r * 2; })
      .style("stroke", "white")
      .style("fill", function(d) { return color(d.att); });

    console.log(d3.select("rect")
              .data(nodes)
              .attr("name","Alabama"));

    node.append("text")
      .attr("dx", function(d) { return d.r/2;})
      .attr("dy", function(d) { return d.r;})
      .text(function(d) { return d.name; })
      .style("font-size", function(d) {return d.value * 10;})
      .style("fill", "white")
      .style("cursor", "default");

////////////////MINIMAP/////////////////////

  var g = svg.selectAll(".minimap")
            .data(us.features)
            .enter()
            .append("g");

      g.selectAll("path")
          .data(us.features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", "feature")
          .style("stroke", "white");

      g.selectAll("path")
          .data(nodes)
          .style("fill", function(d) { return color(d.att); });

//////////////MINIMAP END////////////////////

  //function minimouseover

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
};

