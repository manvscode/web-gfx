import { GFX } from './lib/gfx.js';

if( !GFX.isSupported() ) {
    throw "GFX is not supported!";
}

const canvas = document.getElementById('gfx');
const attributes = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
};

console.info( "Starting application..." );

const gfx = new GFX(canvas, attributes);
let gl = gfx.getContext();
gfx.printInfo();

const color = [ 0.0, 0.0, 0.0, 1.0 ];
let step = 0.001;
let delta = 0;

const flasher = function() {
    let now = gfx.now();

    gl.clearColor( color[0], color[1], color[2], 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    color[0] += step * delta;
    if( color[0] > 1.0 || color[0] < 0.0 ) step *= -1;

    delta = gfx.frameDelta( now );
    gfx.requestAnimationFrame( flasher );
};

flasher();
