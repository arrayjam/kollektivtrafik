shapes_to_topojson: data/ node_modules/
	sh shapes_to_topojson.sh

extract_gtfs: sources/ sources/gtfs.zip sources/types node_modules/
	sh extract_gtfs.sh

shapes_to_topojson: data/ node_modules/
	sh shapes_to_topojson.sh

sources/gtfs.zip:
	curl "http://data.ptv.vic.gov.au/downloads/gtfs.zip" --compressed > $@

data/:
	mkdir -p $@

sources/:
	mkdir -p $@

sources/types:
	mkdir -p $@

node_modules/:
	npm install

clean:
	rm -r sources/types data

.PHONY: extract_gtfs clean
