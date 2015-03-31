#!/bin/sh

set -e

7za x sources/gtfs.zip -osources/types -y

for type in 1 2 3 4 5 6 7 8 10 11; do
  7za x sources/types/$type/google_transit.zip -osources/types/$type/ -y
  dos2unix sources/types/$type/shapes.txt
done

