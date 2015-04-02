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
