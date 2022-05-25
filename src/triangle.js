import { GFX, Attribute, Uniform, Shader } from './lib/gfx.js';

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

gfx.resize();
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.enable( gl.DEPTH_TEST );
gl.clearDepth(1.0);
gl.depthFunc(gl.LEQUAL);

gl.disable( gl.CULL_FACE );
gl.cullFace( gl.BACK );
gl.frontFace( gl.CCW );

gl.disable( gl.BLEND );
gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
gfx.assertNoError();

gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
let angle = 0;
let delta = 0;

const triangleVertices = [
     0.0000000000000001,   1.0000000000000000 -0.02,   0.0000000000000000,
     1.0000000000000000,   0.0000000000000000,   0.0000000000000000,

    -0.8660254037844387,  -0.4999999999999999,   0.0000000000000000,
     0.0000000000000000,   1.0000000000000000,   0.0000000000000000,

     0.8660254037844385,  -0.5000000000000002,   0.0000000000000000,
     0.0000000000000000,   0.0000000000000000,   1.0000000000000000
];

const vboTriangle = gfx.floatBufferCreate( triangleVertices, 6, 3, gl.STATIC_DRAW );

const triangle_shader = gfx.glslProgramObject([
		{ type: gl.VERTEX_SHADER, url:   "assets/shaders/triangle-100.v-glsl" },
		{ type: gl.FRAGMENT_SHADER, url: "assets/shaders/triangle-100.f-glsl" },
	], [
		{ name: Attribute.vertex, variable: "a_vertex" },
		{ name: Attribute.color, variable: "a_color" },
	], [
		{ name: Uniform.modelView, variable: "u_model_view" },
	]);

const spinning_triangle = () => {
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    let aspect = gfx.getAspectRatio();

	let projectionMatrix = GFX.Math.Projections.orthographic( -2 * aspect, 2 * aspect, -2, 2, -10, 10 );
	let translation = GFX.Math.Transforms.translate( new GFX.Math.Vector3(0, 0, -2) );
    let orientation = GFX.Math.Transforms.rotateZ( angle );
    let transform = translation.multiply( orientation );
	let modelView = projectionMatrix.multiplyMatrix( transform );

	if( angle >= GFX.Math.Core.TWO_PI ) {
		angle = 0.0;
	}
	else {
		angle += 0.001 * delta;
	}

	triangle_shader.use();

	triangle_shader.prepare([
		{ name: Uniform.modelView, value: modelView },
	], false);


	gl.bindBuffer( gl.ARRAY_BUFFER, vboTriangle );
	gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.vertex, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0 );
	gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3 );
	gfx.assertNoError( );

	gl.drawArrays( gl.TRIANGLES, 0, vboTriangle.count );
	gfx.assertNoError( );

	gl.flush();
	gfx.requestAnimationFrame( spinning_triangle );
	delta = gfx.frameDelta( now );
	gfx.printFrameRate( delta );
};

spinning_triangle();
