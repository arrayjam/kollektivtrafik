var d3 = require("d3"),
    topojson = require("topojson"),
    turf = require("turf"),
    rw = require("rw"),
    verbose = false;

var contents = rw.readFileSync("/dev/stdin", "utf8");

var csv = d3.csv.parse(contents);

var shapes = {};

csv.forEach(function(row) {
    var id = row.shape_id;
    shapes[id] = shapes[id] || [];

    var point = {
        position: [+row.shape_pt_lon, +row.shape_pt_lat],
        sequence: +row.shape_pt_sequence,
        distance: +row.shape_dist_traveled
    };

    shapes[id].push(point);
});

var sequenceSort = function(a, b) {
    return a.sequence - b.sequence;
};

var features = [];

for(var id in shapes) {
    shapes[id] = shapes[id].sort(sequenceSort);
    shapes[id].forEach(function(point) {
        delete point.sequence;
    });

    var maxDistance = shapes[id][shapes[id].length - 1].distance;

    shapes[id].forEach(function(point) {
        delete point.distance;
    });

    shapes[id] = shapes[id].map(function(point) {
        return point.position;
    });

    var linestring = turf.linestring(shapes[id], {
        id: id,
        distance: maxDistance
    });

    features.push(linestring);
}

var featureCollection = turf.featurecollection(features);

var topology = topojson.topology({collection: featureCollection}, {
    verbose: verbose,
    id: function(d) { return d.properties.id; },
    quantization: 1e5,
    "property-transform": function(feature) {
        return {
            distance: feature.properties.distance
        };
    }
});

// var simplified = topojson.simplify(topology, {verbose: verbose, "coordinate-system": "spherical", "minimum-area": 1e-10});

rw.writeFileSync("/dev/stdout", JSON.stringify(topology), "utf8");
