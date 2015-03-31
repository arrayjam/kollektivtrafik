var d3 = require("d3"),
    topojson = require("topojson"),
    turf = require("turf"),
    rw = require("rw");

var contents = rw.readFileSync("/dev/stdin", "utf8");

var csv = d3.csv.parse(contents);

var shapes = {};

csv.forEach(function(row) {
    var id = row.shape_id;
    shapes[id] = shapes[id] || [];

    var point = {
        position: [+row.shape_pt_lon, +row.shape_pt_lat],
        sequence: +row.shape_pt_sequence,
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

    shapes[id] = shapes[id].map(function(point) {
        return point.position;
    });

    var linestring = turf.linestring(shapes[id], {
        id: id
    });

    features.push(linestring);
}

var featureCollection = turf.featurecollection(features);
// console.log(featureCollection.features.map(function(d) { return d.properties; }));

var topology = topojson.topology({collection: featureCollection}, {verbose: true, id: function(d) { return d.properties.id; }});
console.log(topology.objects.collection);

rw.writeFileSync("shapes.topojson", JSON.stringify(topology), "utf8");
