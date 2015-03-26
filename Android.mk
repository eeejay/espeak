# Copyright 2008 Google Inc. All Rights Reserved.
#
# Android.mk for espeak
#

LOCAL_PATH:= $(call my-dir)
include $(CLEAR_VARS)

LOCAL_SRC_FILES:= \
	src/speak_lib.cpp \
	src/compiledict.cpp \
	src/dictionary.cpp \
	src/intonation.cpp \
	src/readclause.cpp \
	src/setlengths.cpp \
	src/numbers.cpp \
	src/synth_mbrola.cpp \
	src/synthdata.cpp \
	src/synthesize.cpp \
	src/translate.cpp \
	src/mbrowrap.cpp \
	src/tr_languages.cpp \
	src/voices.cpp \
	src/wavegen.cpp \
	src/phonemelist.cpp \
	src/espeak_command.cpp \
	src/event.cpp \
	src/fifo.cpp \
	src/wave.cpp \
	src/debug.cpp \
	src/klatt.cpp \
	src/sonic.cpp

LOCAL_PRELINK_MODULE:= false

LOCAL_MODULE:= libespeak

LOCAL_CPPFLAGS+= $(TOOL_CFLAGS) -DDEBUG_ENABLED=1 -DPATH_ESPEAK_DATA=\"/system/tts/espeak-data\"

LOCAL_LDFLAGS:= $(TOOL_LDFLAGS) -lstdc++ -lc

include $(BUILD_SHARED_LIBRARY)
