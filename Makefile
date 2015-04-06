TRANSPORT_TYPES = 1 2 3 4 5 6 7 8 10
GTFS_FILE_TYPES = agency calendar_dates routes stop_times trips calendar shapes stops
GTFS_FILES = $(addsuffix .txt,$(GTFS_FILE_TYPES))
GTFS_FILES_WILDCARD = $(addprefix sources/types/%/,$(GTFS_FILES))
GTFS_DIRS = $(addprefix sources/types/,$(TRANSPORT_TYPES))
GOOGLE_TRANSIT_ZIPS = $(addsuffix /google_transit.zip,$(GTFS_DIRS))
TOPOJSON_FILES = $(addsuffix .topojson,$(addprefix data/,$(TRANSPORT_TYPES)))

all:
	make $(TOPOJSON_FILES)

data/%.topojson: sources/types/%/shapes.csv
	@[ -d $(@D) ] || mkdir -p $(@D)
	node shapes_to_topojson.js $(<D) > $@

%.csv: %.txt
	cp $< $@
	dos2unix $@

$(GTFS_FILES_WILDCARD): sources/types/%/google_transit.zip
	7za x $< -o$(@D)
	@find $(@D) -name "*.txt" -exec touch {} +

sources/types/%/google_transit.zip: sources/gtfs.zip
	7za x $< -osources/types -y
	@find sources/types -name google_transit.zip -exec touch {} +

test:
	echo $(TRANSPORT_TYPES)

sources/gtfs.zip:
	@[ -d $(@D) ] || mkdir -p $(@D)
	curl "http://data.ptv.vic.gov.au/downloads/gtfs.zip" --compressed > $@

node_modules/:
	npm install

dist: all
	rm -r sources/types

clean:
	rm -r sources/types data

# No intermediate files should be deleted
.SECONDARY:

.PHONY: node_modules clean dist

