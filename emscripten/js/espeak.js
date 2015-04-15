function Espeak(worker_path, ready_cb) {
  this.worker = new Worker(worker_path);
  this.ready = false;
  this.worker.onmessage = function(e) {
    if (e.data !== 'ready') return;
    this.worker.onmessage = null;
    this.worker.addEventListener('message', this);
    this.ready = true;
    if (ready_cb) {
      ready_cb();
    }
  }.bind(this);
}

Espeak.prototype.handleEvent = function (evt) {
  var callback = evt.data.callback;
  if (callback && this[callback]) {
    if (evt.data.delete_callback) {
      delete this[callback];
      return;
    }
    this[callback].apply(this, evt.data.result);
    if (evt.data.done)
      delete this[callback];
    return;
  }
};

function _createAsyncMethod(method) {
  return function() {
    var lastArg = arguments[arguments.length - 1];
    var message = { method: method, args: Array.prototype.slice.call(arguments, 0) };
    if (typeof lastArg == 'function') {
      var callback = '_' + method + '_' + Math.random().toString().substring(2) +'_cb';
      this[callback] = lastArg;
      message.args.pop();
      message.callback = callback;
    }
    this.worker.postMessage(message);
  };
}

for (var method of ['listVoices', 'get_rate', 'get_pitch',
                    'set_rate', 'set_pitch', 'setVoice', 'synth']) {
  Espeak.prototype[method] = _createAsyncMethod(method);
}


/* An audio node that can have audio chunks pushed to it */

function PushAudioNode(context, buffersize) {
  this.samples_queue = [];
  this.scriptNode = context.createScriptProcessor(1024, 1, 1);
  this.connected = false;
  this.sinks = [];
}

PushAudioNode.prototype.push = function(chunk) {
  this.samples_queue.push(chunk);
  if (!this.connected) {
    if (!this.sinks.length)
      throw "No destination set for PushAudioNode";
    this._do_connect();
  }
}

PushAudioNode.prototype.connect = function(dest) {
  this.sinks.push(dest);
  if (this.samples_queue.length) {
    this._do_connect();
  }
}

PushAudioNode.prototype._do_connect = function() {
  if (this.connected) return;
  this.connected = true;
  for (var dest of this.sinks) {
    this.scriptNode.connect(dest);
  }
  this.scriptNode.onaudioprocess = this.handleEvent.bind(this);
}


PushAudioNode.prototype.disconnect = function() {
  this.scriptNode.onaudioprocess = null;
  this.scriptNode.disconnect();
  this.connected = false;
}

PushAudioNode.prototype.handleEvent = function(evt) {
  if (!this.samples_queue.length) {
    this.disconnect();
  }

  var offset = 0;
  while (this.samples_queue.length && offset < evt.target.bufferSize) {
    var chunk = this.samples_queue[0];
    var to_copy = chunk.subarray(0, evt.target.bufferSize - offset);
    if (evt.outputBuffer.copyToChannel) {
      evt.outputBuffer.copyToChannel(to_copy, 0, offset);
    } else {
      evt.outputBuffer.getChannelData(0).set(to_copy, offset);
    }
    offset += to_copy.length;
    chunk = chunk.subarray(to_copy.length);
    if (chunk.length)
      this.samples_queue[0] = chunk;
    else
      this.samples_queue.shift();
  }
}
