#!/bin/bash

rm -rf js/
traceur --modules instantiate --dir src/lib js/lib  --source-maps file
traceur --modules inline --outputLanguage=es6 --out js/app.js  --source-maps file -- ./src/app.js
traceur --modules inline --outputLanguage=es6 --out js/flasher.js  --source-maps file -- ./src/flasher.js
traceur --modules inline --outputLanguage=es6 --out js/triangle.js  --source-maps file -- ./src/triangle.js

