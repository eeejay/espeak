#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include "speak_lib.h"

static int gSamplerate = 0;

class EspeakWorker {
public:
  EspeakWorker() : rate(espeakRATE_NORMAL), pitch(50), current_voice(NULL) {
    if (!gSamplerate) {
      gSamplerate = espeak_Initialize(
        AUDIO_OUTPUT_SYNCHRONOUS, 100, NULL, espeakINITIALIZE_DONT_EXIT);
    }
    samplerate = gSamplerate;
    voices = espeak_ListVoices(NULL);
  }

  void synth_(const char* aText, void* aCallback) {
    t_espeak_callback* cb = reinterpret_cast<t_espeak_callback*>(aCallback);
    espeak_SetSynthCallback(cb);
    espeak_SetParameter(espeakPITCH, pitch, 0);
    espeak_SetParameter(espeakRATE, rate, 0);

    if (current_voice)
      espeak_SetVoiceByProperties(current_voice);
    else
      espeak_SetVoiceByName("default");

    espeak_Synth(aText, 0, 0, POS_CHARACTER, 0, 0, NULL, NULL);

    // Reset callback so other instances will work too.
    espeak_SetSynthCallback(NULL);
  }

  void setVoice(const char* aName, const char* aLang,
                unsigned char aGender=0, unsigned char aAge=0,
                unsigned char aVariant = 0) {
    espeak_VOICE props = { 0 };
    props.name = aName;
    props.languages = aLang;
    props.gender = aGender;
    props.age = aAge;
    props.variant = aVariant;
    // This way we don't need to allocate the name/lang strings to the heap.
    // Instead, we store the actual global voice.
    espeak_SetVoiceByProperties(&props);
    current_voice = espeak_GetCurrentVoice();
  }

  int getSizeOfEventStruct_() {
    return sizeof(espeak_EVENT);
  }

  const espeak_VOICE** voices;
  int samplerate;
  int rate;
  int pitch;

private:
  espeak_VOICE* current_voice;
};

#include <glue.cpp>

