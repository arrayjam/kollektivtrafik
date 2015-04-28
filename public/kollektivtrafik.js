/* globals queue, transit, crossfilter */

queue()
    .defer(d3.json, "data/2/shapes.topojson")
    .defer(d3.json, "data/2/trips.json")
    .defer(d3.csv, "data/2/calendar.csv")
    .await(ready);

var width = 960,
    height = 960;

var projection = d3.geo.mercator()
    .scale(1 << 16)
    .translate([width / 2, height / 2])
    .center([144.9631, -37.8136])
    .precision(0.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

function ready(error, shapes, trips, calendar) {
    var serviceID = "T0",
        from = 43200,
        to = 50000,
        timestamp = from;

    var shapeGeoJson = topojson.feature(shapes, shapes.objects.collection);

    svg.selectAll("path").data(shapeGeoJson.features)
        .enter().append("path")
        .attr("class", "line")
        .attr("d", path);

    var tripCF = crossfilter(trips);

    var services = tripCF.dimension(function(d) { return d.service_id; });
    var startTime = tripCF.dimension(function(d) { return d.stops[0].arrival; });
    var endTime = tripCF.dimension(function(d) { return d.stops[d.stops.length - 1].departure; });
    services.filter(serviceID);
    startTime.filterRange([from, to]);
    endTime.filterRange([from, to]);

    var lineCF = crossfilter(shapeGeoJson.features);

    var lines = lineCF.dimension(function(d) { return d.id; });


    function get() { return services.top(Infinity); }

    var scales = [];
    get().forEach(function(trip) {
        var stops = trip.stops;
        var allTimes = [];
        stops.forEach(function(d) {
            allTimes.push({
                timestamp: d.arrival,
                distance: d.distance
            });

            allTimes.push({
                timestamp: d.departure,
                distance: d.distance
            });
        });

        var tripScale = d3.scale.linear().clamp(true)
            .domain(allTimes.map(function(d) { return d.timestamp; }))
            .range(allTimes.map(function(d) { return d.distance; }));

        scales.push({scale: tripScale, shape_id: trip.shape_id});
    });


    function for_ts(time) {
        var points = [];
        scales.forEach(function(scale) {
            var lineString = lines.filter(scale.shape_id).top(Infinity)[0];
            points.push(turf.along(lineString, scale.scale(time) / 1000, "kilometers"));
        });

        var mapPoints = svg.selectAll("circle").data(points.map(function(d) { return d.geometry.coordinates; }));

        mapPoints.enter().append("circle");

        mapPoints
            .attr("cx", function(d) { return projection(d)[0]; })
            .attr("cy", function(d) { return projection(d)[1]; })
            .attr("r", 4);

        mapPoints.exit().remove();
    }

    var req = window.requestAnimationFrame(step);

    function step() {
        for_ts(timestamp);

        timestamp += 10;

        if(timestamp > to) {
            window.cancelAnimationFrame(req);
        } else {
            window.requestAnimationFrame(step);
        }
    }





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
