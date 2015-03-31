TYPES = 1 2 3 4 5 6 7 8 10 11
# GTFS_FILES = agency calendar calendar_dates routes shapes stop_times stops trips
TYPES_DIRS = $(addprefix sources/types/,$(TYPES))
TRANSIT_ZIPS = $(addsuffix /google_transit.zip,$(TYPES_DIRS))
GTFS_SHAPES_FILES = $(addsuffix /shapes.txt,$(TYPES_DIRS))
TOPOJSON_SHAPES = $(addsuffix _shapes.topojson,$(addprefix data/,$(TYPES)))

# all: data/1_shapes.topojson data/2_shapes.topojson

sources/gtfs.zip:
	curl "http://data.ptv.vic.gov.au/downloads/gtfs.zip" --compressed > $@

sources/types:
	mkdir -p $@

$(TRANSIT_ZIPS): sources/gtfs.zip sources/types
	@7za x sources/gtfs.zip -osources/types 1>/dev/null
	@touch $(TRANSIT_ZIPS)

# data/1_shapes.topojson: data/1_shapes.csv
# data/2_shapes.topojson: data/2_shapes.csv
# data/3_shapes.topojson: data/3_shapes.csv
# data/4_shapes.topojson: data/4_shapes.csv
# data/5_shapes.topojson: data/5_shapes.csv
# data/6_shapes.topojson: data/6_shapes.csv
# data/7_shapes.topojson: data/7_shapes.csv
# data/8_shapes.topojson: data/8_shapes.csv
# data/10_shapes.topojson: data/10_shapes.csv
# data/11_shapes.topojson: data/11_shapes.csv

sources/types/%/shapes.txt: sources/types/%/google_transit.zip
	@echo $^
	@7za x $^ -o$(dir $^) 1>/dev/null
	@touch $@

data/:
	@mkdir -p $@

data/%_shapes.csv: sources/types/%/shapes.txt data/
	echo $?
	@cp $< $<.bak
	@dos2unix -n $< $@
	@touch $@
	@mv $<.bak $<

data/%_shapes.topojson: data/%_shapes.csv data/
	echo "BOOOOOP" $@
	@node shapes_to_topojson.js < $< > $@

clean:
	rm -r sources/types data

all: $(TOPOJSON_SHAPES)

