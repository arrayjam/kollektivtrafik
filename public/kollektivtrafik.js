var d3 = require("d3"),
    topojson = require("topojson"),
    queue = require("queue-async"),
    turf = require("turf"),
    crossfilter = require("crossfilter"),
    operative = require("operative");

console.log(operative);
var calculator = operative({
    add: function(a, b, cb) {
        var s = d3.scale.linear().domain([0, 1]).range([0, 10]);
        cb(s(a + b));
    }
});

calculator.add(0.1, 0.2, function(result) {
    console.log(result); // => 3
});

var transportType = window.transportType || 2;
// queue()
//     .defer(d3.json, "data/" + transportType + "/shapes.topojson")
//     .defer(d3.json, "data/" + transportType + "/trips.json")
//     .defer(d3.csv,  "data/" + transportType + "/calendar.csv")
//     .await(ready);

var width = 960,
    height = 960;

var projection = d3.geo.mercator()
    .scale(1 << 16)
    .translate([400, 400])
    .center([144.9631, -37.8136])
    .precision(0.1);

var path = d3.geo.path()
    .projection(projection);

var textDisplay = d3.select("body").append("h1").attr("class", "time");

var pad0 = d3.format("02d");

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

function ready(error, shapes, trips, calendar) {
    var serviceID = "T0",
    // var serviceID = "T0+a5",
        // from = 15400,
        from = 15900,
        // from = 28800,
        to = 86400,
        timestep = 4,
        pulse = false,
        timestamp = from;

    var shapeFeatures = topojson.feature(shapes, shapes.objects.collection);
    var shapeMesh = topojson.mesh(shapes, shapes.objects.collection);

    svg.append("path").datum(shapeMesh)
        .attr("class", "line")
        .attr("d", path);


    // var tripCF = crossfilter(trips);

    // var services = tripCF.dimension(function(d) { return d.service_id; });
    // var startTime = tripCF.dimension(function(d) { return d.stops[0].arrival; });
    // var endTime = tripCF.dimension(function(d) { return d.stops[d.stops.length - 1].departure; });
    // services.filter(serviceID);
    // startTime.filterRange([from, to]);
    // endTime.filterRange([from, to]);

    var lineCF = crossfilter(shapeFeatures.features);

    var lines = lineCF.dimension(function(d) { return d.id; });


    // function get() { return services.top(Infinity); }
    function get() { return trips; }

    var scales = [];
    get().forEach(function(trip) {
        var stops = trip.stops;
        var allTimes = [];
        stops.forEach(function(d) {
            allTimes.push({
                timestamp: d.arrival,
                distance: d.distance / 1000
            });

            allTimes.push({
                timestamp: d.departure,
                distance: d.distance / 1000
            });
        });

        var minTime = stops[0].arrival,
            maxTime = stops[stops.length - 1].departure;

        allTimes.unshift({timestamp: minTime, distance: void 0});
        allTimes.push({timestamp: maxTime, distance: void 0});

        var tripScale = d3.scale.linear().clamp(true)
            .domain(allTimes.map(function(d) { return d.timestamp; }))
            .range(allTimes.map(function(d) { return d.distance; }));

        scales.push({
            scale: tripScale,
            shape_id: trip.shape_id,
            minTime: minTime,
            maxTime: maxTime,
            arrivalStationTimes: stops.map(function(d) { return d.arrival; }),
            departureStationTimes: stops.map(function(d) { return d.departure; })
        });
    });

    var lineStrings = {};
    shapeFeatures.features.forEach(function(line) {
        lineStrings[line.id] = line;
    });


    function for_ts(time) {
        var points = [];
        scales.forEach(function(scale) {
            if(time >= scale.minTime && time <= scale.maxTime) {
                var distance = scale.scale(time);
                if(distance) {
                    var lineString = lineStrings[scale.shape_id];
                    var newPoint = turf.along(lineString, distance, "kilometers");
                    if(pulse) {
                        newPoint.properties.arrival = scale.arrivalStationTimes.indexOf(time) >= 0;
                        newPoint.properties.departure = scale.departureStationTimes.indexOf(time) >= 0;
                    }
                    points.push(newPoint);
                }
            }
        });

        var mapPoints = svg.selectAll("circle").data(points);

        mapPoints.enter().append("circle").attr("r", 3);

        mapPoints
            .attr("cx", function(d) { return projection(d.geometry.coordinates)[0]; })
            .attr("cy", function(d) { return projection(d.geometry.coordinates)[1]; });

        if(pulse) {
            mapPoints
            .style("fill", function(d) {
                if(d.properties.arrival) {
                    return "red";
                } else if(d.properties.departure) {
                    return "green";
                } else {
                    return "black";
                }
            })
            .attr("r", function(d) { return (d.properties.arrival || d.properties.departure) ? 5 : 3; });
        }

        mapPoints.exit().remove();

        textDisplay.text(pad0((((timestamp / 60 / 60) | 0) % 24)) + ":" +
                         pad0((((timestamp / 60) | 0) % 60)) + ":" +
                         pad0((timestamp % 60)));
    }

    // setInterval(function() {
    d3.timer(function() {
        for_ts(timestamp);

        timestamp += timestep;

        if(timestamp > to) {
            return true;
        } else {
            return false;
        }
    });
        // }, 100);




    // turf.along(line, distance, [units=miles])

    // debugger
    console.log(arguments);
    // console.log(arguments);

    // shape
    // id: "3-5-D-mjp-1.4.R"
    // properties.distance: 3620.35036416569



    //{13791138.T2.2-EPP-G-mjp-1.12.R:
    //   route_id: "2-EPP-G-mjp-1"
    //   service_id: "T2_2"
    //   shape_id: "2-EPP-G-mjp-1.12.R"
    //   stops: [
    //     arrival: 17820
    //     departure: 17820
    //     distance: 0
    //     stop_id: 45795

}
