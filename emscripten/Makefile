WEBIDL_BINDER=python $(EMSCRIPTEN)/tools/webidl_binder.py

SRCS = ../src/speak_lib.cpp \
	../src/compiledict.cpp \
	../src/dictionary.cpp \
	../src/intonation.cpp \
	../src/readclause.cpp \
	../src/setlengths.cpp \
	../src/numbers.cpp \
	../src/synth_mbrola.cpp \
	../src/synthdata.cpp \
	../src/synthesize.cpp \
	../src/translate.cpp \
	../src/mbrowrap.cpp \
	../src/tr_languages.cpp \
	../src/voices.cpp \
	../src/wavegen.cpp \
	../src/phonemelist.cpp \
	../src/espeak_command.cpp \
	../src/event.cpp \
	../src/fifo.cpp \
	../src/wave.cpp \
	../src/debug.cpp \
	../src/klatt.cpp \
	../src/sonic.cpp

OBJS=$(patsubst ../src/%.cpp,%.o,$(SRCS))
SRC += espeak_glue_wrapper.cpp
OBJS += espeak_glue_wrapper.o

POSTJS=glue.js post.js

CXXFLAGS+=-D PATH_ESPEAK_DATA=\"/espeak-data\" -I . -I ../src

DEBUG ?= 1
ifneq ($(DEBUG), 1)
    CXXFLAGS+=-O3
endif

all: js/espeak.worker.js

glue.cpp: espeak_glue.idl
	$(WEBIDL_BINDER) espeak_glue.idl glue

glue.js: glue.cpp

%.o: ../src/%.cpp
	$(CXX) $(CXXFLAGS) -c $<

js/espeak.worker.js: glue.cpp $(OBJS) $(POSTJS)
	mkdir -p js
	$(CXX) $(CXXFLAGS) $(OBJS) -s RESERVED_FUNCTION_POINTERS=2 \
	  --preload-file ../espeak-data@/espeak-data/ --memory-init-file 0 \
	  $(patsubst %,--post-js %,$(POSTJS)) -o $@

clean:
	rm -f *.o glue.* js/espeak.worker.data js/espeak.worker.js
