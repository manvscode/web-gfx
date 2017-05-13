#!/bin/bash

function clean() {
	echo "Cleaning..."
	rm -rf js/
	rm -f publish.zip
}

if [ "$1" = "clean" ]; then
	clean
elif [ "$1" = "release" ]; then
	clean
	echo "Building release..."
	traceur --modules instantiate --dir src/lib js/lib

	# App Files
	traceur --modules inline --outputLanguage=es6 --out js/app.js --source-maps file -- ./src/app.js ./src/renderable.js ./src/background.js ./src/oceanfloor.js ./src/underwaterbase.js ./src/submarine.js
	traceur --modules inline --outputLanguage=es6 --out js/flasher.js -- ./src/flasher.js
	traceur --modules inline --outputLanguage=es6 --out js/triangle.js -- ./src/triangle.js
else
	clean
	echo "Building debug..."
	traceur --modules instantiate --dir src/lib js/lib  --source-maps file

	# App Files
	traceur --modules inline --outputLanguage=es6 --out js/app.js --source-maps file -- ./src/app.js ./src/renderable.js ./src/background.js ./src/oceanfloor.js ./src/underwaterbase.js ./src/submarine.js
	traceur --modules inline --outputLanguage=es6 --out js/flasher.js  --source-maps file -- ./src/flasher.js
	traceur --modules inline --outputLanguage=es6 --out js/triangle.js  --source-maps file -- ./src/triangle.js
fi
