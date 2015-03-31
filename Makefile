extract_gtfs: sources/gtfs.zip sources/types
	sh extract_gtfs.sh

shapes_to_topojson: data/
	sh shapes_to_topojson.sh

sources/gtfs.zip:
	curl "http://data.ptv.vic.gov.au/downloads/gtfs.zip" --compressed > $@

data/:
	mkdir -p $@

sources/types:
	mkdir -p $@

clean:
	rm -r sources/types data

.PHONY: extract_gtfs clean
