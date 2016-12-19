import { GFX, Lib3dMath, Attribute, Uniform, Shader } from './lib/gfx.js';

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

gl.viewport(0, 0, gl.canvas.offsetWidth, gl.canvas.offsetHeight);

gl.enable( gl.DEPTH_TEST );
gl.clearDepth(1.0);
gl.depthFunc(gl.LEQUAL);

gl.disable( gl.CULL_FACE );
gl.cullFace( gl.BACK );
gl.frontFace( gl.CCW );

gl.disable( gl.BLEND );
gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
gfx.assertNoError();

gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
//gl.clearColor( 0, 0, 0, 0.0 );


var angle = 0;
var delta = 0;

var triangleVertices = [
   1.0000000000000000,   0.0000000000000000,   0.0000000000000000,
   1.0000000000000000,   0.0000000000000000,   0.0000000000000000,

  -0.4999999999999999,   0.8660254037844387,   0.0000000000000000,
   0.0000000000000000,   1.0000000000000000,   0.0000000000000000,

  -0.5000000000000001,  -0.8660254037844386,   0.0000000000000000,
   0.0000000000000000,   0.0000000000000000,   1.0000000000000000
];

var vboTriangle = gfx.floatBufferCreate( triangleVertices, 6, 3, gl.STATIC_DRAW );

var triangle_shader = gfx.glslProgramObject([
		{ type: gl.VERTEX_SHADER, url:   "assets/shaders/triangle-100.v-glsl" },
		{ type: gl.FRAGMENT_SHADER, url: "assets/shaders/triangle-100.f-glsl" },
	], [
		{ name: Attribute.vertex, variable: "a_vertex" },
		{ name: Attribute.color, variable: "a_color" },
	], [
		{ name: Uniform.modelView, variable: "u_model_view" },
	]);

var spinning_triangle = () => {
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	var projectionMatrix = Lib3dMath.Matrix4.IDENTITY;
	//var projectionMatrix = Lib3dMath.Projections.orthographic( -2 * gfx.getAspectRatio(), 2 * gfx.getAspectRatio(), -2, 2, -10, 10 );
	var transform = Lib3dMath.Transforms.rotateZ( angle );
	//var transform = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0, 0, -2) ).multiplyMatrix( Lib3dMath.Transforms.rotateZ( angle ) );
	var modelView = projectionMatrix.multiplyMatrix( transform );

	if( angle >= Lib3dMath.Core.TWO_PI ) {
		angle = 0.0;
	}
	else {
		angle += 0.001 * delta;
	}

	triangle_shader.use();

	//console.info( "Angle: " + angle );

	triangle_shader.prepare([
		{ name: Uniform.modelView, value: modelView },
	], false);

	console.info( "Projection:\n" + projectionMatrix );
	console.info( "Model View:\n" + modelView );

	gl.bindBuffer( gl.ARRAY_BUFFER, vboTriangle );
	this.gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.vertex, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0 );
	this.gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3 );
	this.gfx.assertNoError( );

	gl.drawArrays( gl.TRIANGLES, 0, vboTriangle.count );
	this.gfx.assertNoError( );

	gl.flush();
	gfx.requestAnimationFrame( spinning_triangle );
	delta = gfx.frameDelta( now );
	//gfx.printFrameRate( delta );
};

spinning_triangle();
