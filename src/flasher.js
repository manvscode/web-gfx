import { GFX } from './lib/gfx.js';

if( !GFX.isSupported() ) {
	throw "GFX is not supported!";
}

var canvas = document.getElementById('gfx');
var attributes = {
	alpha: true,
	depth: false,
	stencil: false,
	antialias: true,
	premultipliedAlpha: false,
	preserveDrawingBuffer: false,
};

console.info( "Starting application..." );

var gfx = new GFX(canvas, attributes);
let gl = gfx.getContext();
gfx.printInfo();

var color = [ 0.0, 0.0, 0.0, 1.0 ];
var step = 0.001;
var delta = 0;

var flasher = function() {
	let now = gfx.now();

	gl.clearColor( color[0], color[1], color[2], 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	color[0] += step * delta;
	if( color[0] > 1.0 || color[0] < 0.0 ) step *= -1;

	delta = gfx.frameDelta( now );
	gfx.requestAnimationFrame( flasher );
};

flasher();
