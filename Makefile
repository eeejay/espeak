TOP := $(shell pwd)

all: binaries all-voices

binaries:
	cp src/portaudio.h src/_portaudio.h
	cp src/portaudio19.h src/portaudio.h
	$(MAKE) -C src
	$(MAKE) -C src -f Makefile.espeakedit
	mv src/_portaudio.h src/portaudio.h

phonemes:
	rm -f $(TOP)/espeak-data/dictsource
	rm -f $(TOP)/espeak-data/phsource
	ln -s $(TOP)/dictsource $(TOP)/espeak-data/
	ln -s $(TOP)/phsource $(TOP)/espeak-data/
	HOME=$(TOP) LD_LIBRARY_PATH=$(TOP)/src $(TOP)/src/espeakedit --compile
	rm -f $(TOP)/espeak-data/dictsource
	rm -f $(TOP)/espeak-data/phsource

VOICES = af an bg bn ca cs cy da de el en eo es et eu fa fi fr ga grc	gu hbs \
	hi hu hy id is it jbo ka kn ko ku la lt lv mk ml ms ne nl no pa pl pt ro ru \
	sk sq sv sw ta te tr vi zh zhy

MBROLA_VOICES = af1 cr1 cs de2 de4 de6 ee1 en1 es fr1 gr2 grc-de6 hn1 hu1 ic1 \
	id1 in1 ir1 it3 la1 lt1 lt2 mx1 mx2 nl pl1 pt1 ptbr ptbr4 ro1 sv sv2 tr1 us \
	us3 vz

MBROLA_FILES=$(patsubst %,$(TOP)/espeak-data/mbrola_ph/%_phtrans,$(MBROLA_VOICES))

$(VOICES):
	cd $(TOP)/dictsource && HOME=$(TOP) LD_LIBRARY_PATH=$(TOP)/src $(TOP)/src/espeak --compile=$@ && cd $(TOP)

voices: $(VOICES)

$(MBROLA_FILES):$(TOP)/espeak-data/mbrola_ph/%_phtrans:$(TOP)/phsource/mbrola/%
	mkdir -p $(TOP)/espeak-data/mbrola_ph
	HOME=$(TOP) LD_LIBRARY_PATH=$(TOP)/src $(TOP)/src/espeakedit --compile-mbrola $<

mbrola-voices: $(MBROLA_FILES)

all-voices: phonemes voices mbrola-voices

clean:
	rm -f espeak-data/*_dict espeak-data/ph* espeak-data/dictsource espeak-data/intonations
	rm -rf espeak-data/mbrola_ph
	make -C src distclean