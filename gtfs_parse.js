var d3 = require("d3"),
    turf = require("turf"),
    rw = require("rw"),
    path = require("path");

if(process.argv.length < 3) {
    console.log("Usage: node gtfs_parse.js path/to/gtfs/type/root path/to/data/type");
    process.exit(1);
}

var gtfsPath = process.argv[2],
    tripsPath = path.join(gtfsPath, "trips.csv"),
    routesPath = path.join(gtfsPath, "routes.csv"),
    stopTimesPath = path.join(gtfsPath, "stop_times.csv");

var dataPath = process.argv[3],
    routesDataPath = path.join(dataPath, "routes.csv");

var routes = d3.csv.format(d3.csv.parse(rw.readFileSync(routesPath, "utf8")).map(function(route) {
    delete route.agency_id;
    delete route.route_short_name;
    delete route.route_type;
    return route;
}));

rw.writeFileSync(routesDataPath, routes, "utf8");

var trips = {};

d3.csv.parse(rw.readFileSync(tripsPath, "utf8")).forEach(function(trip) {
    var id = trip.trip_id,
        value = {
            route_id: trip.route_id,
            shape_id: trip.shape_id,
            service_id: trip.service_id,
            stops: [],
        };

    trips[id] = value;
});

// console.log(trips);

// rw.writeFileSync("/dev/stdout", JSON.stringify(topology), "utf8");
