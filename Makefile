TRANSPORT_TYPES = 1 2 3 4 5 6 7 8 10
GTFS_FILE_TYPES = agency calendar_dates routes stop_times trips calendar shapes stops
GTFS_FILES = $(addsuffix .txt,$(GTFS_FILE_TYPES))
GTFS_FILES_WILDCARD = $(addprefix sources/types/%/,$(GTFS_FILES))
GTFS_DIRS = $(addprefix sources/types/,$(TRANSPORT_TYPES))
GOOGLE_TRANSIT_ZIPS = $(addsuffix /google_transit.zip,$(GTFS_DIRS))

transit: $(GOOGLE_TRANSIT_ZIPS)
	@echo "Building google_transit.zip files"

%.csv: %.txt
	cp $< $@
	dos2unix $@

$(GTFS_FILES_WILDCARD): sources/types/%/google_transit.zip
	7za x $< -o$(@D)
	@find $(@D) -exec touch {} +

sources/types/%/google_transit.zip: sources/gtfs.zip
	7za x $< -osources/types
	@find sources/types -exec touch {} +

test:
	echo $(TRANSPORT_TYPES)

sources/gtfs.zip:
	@[ -d $(@D) ] || mkdir -p $(@D)
	curl "http://data.ptv.vic.gov.au/downloads/gtfs.zip" --compressed > $@

node_modules/:
	npm install

clean:
	rm -r sources/types data

.PHONY: node_modules clean transit
