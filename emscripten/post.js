EspeakWorker.prototype.listVoices = function() {
  var voices = [];
  var i;
  for (var voice = this.get_voices(i = 0); voice.ptr != 0; voice = this.get_voices(++i)) {
    var v = {
      name: voice.get_name(),
      identifier: voice.get_identifier(),
      languages: [],
    }

    var ii = 0;
    var byte = voice.get_languages(ii);

    function nullTerminatedString(offset) {
      var str = '';
      var index = offset;
      var b = voice.get_languages(index++);
      while (b != 0) {
        str += String.fromCharCode(b);
        b = voice.get_languages(index++);
      }

      return str;
    }

    while (byte != 0) {
      var lang = { priority: byte, name: nullTerminatedString(++ii) }
      v.languages.push(lang);
      ii += lang.name.length + 1;
      byte = voice.get_languages(ii);
    }

    voices.push(v);

  }
  return voices;
};

var eventTypes = [
  "list_terminated",
  "word",
  "sentence",
  "mark",
  "play",
  "end",
  "msg_terminated",
  "phoneme",
  "samplerate"
]

EspeakWorker.prototype.synth = function (aText, aCallback) {
  var eventStructSize = this.getSizeOfEventStruct_();
  function cb(ptr, length, events_pointer) {
    var data = new Float32Array(length*2);
    for (var i = 0; i < length; i++) {
      data[i*2] = Math.max(-1, Math.min(1, getValue(ptr + i*2, 'i16') / 32768));
      data[i*2+1] = data[i*2];
    }
    var events = [];
    var ptr = events_pointer;
    for (ev = wrapPointer(ptr, espeak_EVENT);
         ev.get_type() != Module.espeakEVENT_LIST_TERMINATED;
         ev = wrapPointer((ptr += eventStructSize), espeak_EVENT)) {
      events.push({
        type: eventTypes[ev.get_type()],
        text_position: ev.get_text_position(),
        word_length: ev.get_length(),
        audio_position: ev.get_audio_position()
      });
    }
    return aCallback(data, events) ? 1 : 0;
  }

  var fp = Runtime.addFunction(cb);
  this.synth_(aText, fp);
  Runtime.removeFunction(fp);
};

// Make this a worker

if (typeof WorkerGlobalScope !== 'undefined') {
  var espeak;

  Module.postRun.push(function () {
    espeak = new EspeakWorker();
    postMessage('ready');
  });

  onmessage = function(e) {
    if (!espeak) {
      throw "espeak not initialized";
    }
    var args = e.data.args;
    var message = { callback: e.data.callback, done: true };
    if (e.data.method == 'synth') {
      args.push(function(samples, events) {
        postMessage(
          { callback: e.data.callback,
            result: [samples.buffer, events] }, [samples.buffer]);
      });
    }
    message.result = [espeak[e.data.method].apply(espeak, args)];
    if (e.data.callback)
      postMessage(message);
  }
}
