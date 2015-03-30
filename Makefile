TOP := $(shell pwd)

all: binaries all-voices

binaries:
	cp src/portaudio.h src/_portaudio.h
	cp src/portaudio19.h src/portaudio.h
	$(MAKE) -C src
	$(MAKE) -C src -f Makefile.espeakedit
	mv src/_portaudio.h src/portaudio.h

voices:
	rm -f $(TOP)/espeak-data/dictsource
	rm -f $(TOP)/espeak-data/phsource
	ln -s $(TOP)/dictsource $(TOP)/espeak-data/
	ln -s $(TOP)/phsource $(TOP)/espeak-data/
	HOME=$(TOP) LD_LIBRARY_PATH=$(TOP)/src $(TOP)/src/espeakedit --compile
	rm -f $(TOP)/espeak-data/dictsource
	rm -f $(TOP)/espeak-data/phsource

MBROLA_SOURCES = $(shell ls $(TOP)/phsource/mbrola)
MBROLA_VOICES = $(patsubst %,$(TOP)/espeak-data/mbrola_ph/%_phtrans,$(MBROLA_SOURCES))

$(MBROLA_VOICES):$(TOP)/espeak-data/mbrola_ph/%_phtrans:$(TOP)/phsource/mbrola/%
	mkdir -p $(TOP)/espeak-data/mbrola_ph
	HOME=$(TOP) LD_LIBRARY_PATH=$(TOP)/src $(TOP)/src/espeakedit --compile-mbrola $<

mbrola-voices: $(MBROLA_VOICES)

all-voices: voices mbrola-voices

clean:
	rm -f espeak-data/*_dict espeak-data/ph* espeak-data/dictsource espeak-data/intonations
	rm -rf espeak-data/mbrola_ph
	make -C src distclean