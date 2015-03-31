#!/bin/sh

set -e

for type in 1 2 3 4 5 6 7 8 10 11; do
  echo "Processing $type"
  node shapes_to_topojson.js < sources/types/"$type"/shapes.txt > data/"$type"_shapes.topojson
done
