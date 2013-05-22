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

// var svg2 = d3.select("#mymap2").append("svg")
//     .attr("width", 960)
//     .attr("height", 200);//TITLE SCREEN

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
            abb = d.properties.abb;
            namestate = d.properties.name;
            ATT = d.properties.ATT;

        return {
          x: point[0]-120, y: point[1]+150,
          x0: point[0]-120, y0: point[1]+150,
          r: radius(ATT), name: namestate,
          abb: abb,
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
      .text(function(d) { return d.abb; })
      .style("font-family", "Arial")
      .style("font-size", function(d) {return (d.value + 100) + " px";})
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
          .style("fill", function(d) { return color(d.att); })
          .on("mouseover",minimouseover)
          .on("mouseout",minimouseout);;

function minimouseover(d){

      var name = d.name;
      console.log(name);
      d3.select(this)
        .style("stroke","black");

      d3.selectAll("."+name)
        .style("fill", "white")
        .style("stroke-width", 3);
    }

function minimouseout(){
      d3.select(this)
        .style("stroke","white");

      node.selectAll("rect")
        .style("fill", function(d) { return color(d.att); })
        .style("stroke-width", 1);
    }
//////////////MINIMAP END////////////////////

/////////TITLE DATA//////////////////////

var yadjust=60

    svg1.append("text")
      .text("AT&T")
      .style("font-size", "66px")
      .style("font-family", "Yanone Kaffeesatz")
      .style("fill","purple")
      .attr("dx", -100)
      .attr("dy", 70+yadjust)
    .transition()
      .delay(500)
      .ease("bounce")
      .duration(2500)
      .attr("dx", 300)
      .attr("dy", 70+yadjust)
    .transition()
      .ease("linear")
      .attr("dx", 200)
      .attr("dy", 70+yadjust);

    svg1.append("text")
      .text("vs.")
      .style("font-size", "136px")
      .style("font-family", "Yanone Kaffeesatz")
      .style("fill","grey")
      .attr("dx", 350)
      .attr("dy", -100+yadjust)
    .transition()
      .ease("backs")
      .delay(1250)
      .duration(4000)
      .attr("dx", 350)
      .attr("dy", 80+yadjust);

    svg1.append("text")
      .text("Verizon")
      .style("font-size", "66px")
      .style("font-family", "Yanone Kaffeesatz")
      .style("fill","green")
      .attr("dx", 1000)
      .attr("dy", 80+yadjust)
    .transition()
      .delay(500)
      .ease("bounce")
      .duration(2500)
      .attr("dx", 400)
      .attr("dy", 80+yadjust)
    .transition()
      .ease("linear")
      .attr("dx", 500)
      .attr("dy", 80+yadjust);

  setInterval(4000,fireworks());

  function fireworks() {
    var transforms = ["100,190","100,220","100,20","-100,200","-100,30","-100,220","-100,20","-200,90",
    "-200,180","-200,80","200,90","200,190","200,170","200,70","-50,180","-50,80",
    "50,180","50,150"];
    for (var i = 0; i < transforms.length; i++) {
      svg1.append("svg:circle")
        .attr("cx",400).attr("cy",45).attr("r",0)
        .style("stroke","yellow").style("fill","grey").style("stroke-opacity",0.5)
        .transition()
          .attr("transform","translate("+transforms[i]+")").delay(5000).duration(2000).ease(Math.sqrt).attr("r",Math.random()*30)
          .style("stroke-opacity",1e-6).style("fill-opacity",1e-6).remove();
    }
  }

  /////////////////TITLE DATA/////////////////

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

