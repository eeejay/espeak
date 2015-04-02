eSpeak.js
=========

Overview
--------

eSpeak.js is an Javascript port of eSpeak.

Usage
-----

Include `js/espeak.js` in your HTML. Create a new Espeak with the path to
`espeak.worker.js` as the first argument. You could supply a callback function
that will be called after the worker successfully initializes eSpeak.

See `espeak.html` for a working demo.

Building
--------

To build espeak.js, you need a working Emscripten development environment.

From the `emscripten` directory run:
`emmake make`

This will build `js/espeak.worker.js` and `js/espeak.worker.data`.
