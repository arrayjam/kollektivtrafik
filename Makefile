# TRANSPORT_TYPES = 1 2 3 4 5 6 7 8 10
TRANSPORT_TYPES = 1 2 3 4 5 6 7 8 10
GTFS_FILE_TYPES = agency calendar_dates routes stop_times trips calendar shapes stops
GTFS_FILES = $(addsuffix .txt,$(GTFS_FILE_TYPES))
GTFS_FILES_WILDCARD = $(addprefix sources/types/%/,$(GTFS_FILES))
GTFS_DIRS = $(addprefix sources/types/,$(TRANSPORT_TYPES))
GOOGLE_TRANSIT_ZIPS = $(addsuffix /google_transit.zip,$(GTFS_DIRS))
DATA_DIRS = $(addprefix public/data/,$(TRANSPORT_TYPES))
TOPOJSON_FILES = $(addsuffix /shapes.topojson,$(DATA_DIRS))
SCHEDULE_FILES = $(addsuffix /compressed.json,$(DATA_DIRS))
TOPOJSON_LINKS = $(addprefix public/data/topojson/,$(addsuffix .topojson,$(TRANSPORT_TYPES)))

all:
	@$(MAKE) $(TOPOJSON_FILES)
	@$(MAKE) $(SCHEDULE_FILES)
	@$(MAKE) $(TOPOJSON_LINKS)

topojson:
	@$(MAKE) $(TOPOJSON_LINKS)

public/data/topojson/%.topojson: public/data/%/shapes.topojson
	@[ -d $(@D) ] || mkdir -p $(@D)
	ln -sf $< ../$@

public/data/%/shapes.topojson: sources/types/%/shapes.csv
	@[ -d $(@D) ] || mkdir -p $(@D)
	node shapes_to_topojson.js $(<D) > $@

public/data/%/compressed.json: public/data/%/trips.json
	cat $< | gzip -9 -c > $@
	ls -h $@

public/data/%/trips.json: sources/types/%/trips.csv sources/types/%/stop_times.csv sources/types/%/routes.csv sources/types/%/calendar.csv gtfs_parse.js
	@[ -d $(@D) ] || mkdir -p $(@D)
	node gtfs_parse.js sources/types/$* public/data/$*

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
	rm -r sources/types public/data

# No intermediate files should be deleted
.SECONDARY:

.PHONY: node_modules clean dist

