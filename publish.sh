#!/bin/sh

DESTDIR=publish
mkdir $DESTDIR

cp -rf assets/ $DESTDIR/assets/
cp -rf css/ $DESTDIR/css/
cp -rf images/ $DESTDIR/images/
cp -rf extern/ $DESTDIR/extern/
cp -rf js/ $DESTDIR/js/
cp index.html $DESTDIR

zip -r publish.zip publish/
rm -rf publish/
