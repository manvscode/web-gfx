import { GFX, Lib3dMath, Attribute, Uniform, Shader } from './lib/gfx.js';
import { Box } from './lib/box.js';

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

/*
var color = [ 1.0, 0.0, 0.0, 1.0 ];
var step = 0.01;

var flasher = function() {
	let now = gfx.now();

	console.info( "Rendering..." );
	gl.clearColor( color[0], color[1], color[2], 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	color[0] += step;
	if( color[0] > 1.0 || color[0] < 0.0 ) step *= -1;

	let delta = gfx.frameDelta( now );
	gfx.printFrameRate( delta );

	gfx.requestAnimationFrame( flasher );
};
*/

var shaders = {};

var initializeObjectShader = () => {
	var shaderAssets = [
		{ type: gl.VERTEX_SHADER, url: "assets/shaders/object-100.v.glsl" },
		{ type: gl.FRAGMENT_SHADER, url: "assets/shaders/object-100.f.glsl" },
	];
	let attributes = [
		{ name: Attribute.vertex, variable: "a_vertex" },
		{ name: Attribute.normal, variable: "a_normal" },
		{ name: Attribute.textureCoord, variable: "a_tex_coord" },
	];
   	let uniforms = [
		{ name: Uniform.projectionMatrix, variable: "u_projection" },
		{ name: Uniform.modelView, variable: "u_model_view" },
		//{ name: Uniform.normalMatrix, variable: "u_normal_matrix" },
		//{ name: Attribute.texture, variable: "u_texture" },
	];

	shaders["objectShader"] = gfx.glslProgramObject( shaderAssets, attributes, uniforms );
};

//initializeObjectShader();


var b = new Box( gfx, 1.0, 1.0, 1.0 );
b.create();


var objects = [];

objects.push( b );

gl.viewport(0, 0, gl.canvas.offsetWidth, gl.canvas.offsetHeight);

gl.enable( gl.DEPTH_TEST );
gl.clearDepth(1.0);                 // Clear everything
gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

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

/*
var render = () => {
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

	shaders.objectShader.use();

	//let textureObject = 0;
	//gl.activeTexture( 0 );
	//gl.bindTexture( textureObject );

	var perspectiveMatrix = Lib3dMath.Projections.perspective( Lib3dMath.Core.toRadians(60.0), gfx.getAspectRatio(), 0.1, 100.0 );
	var modelView = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0.0, -2.0, -8.0) ).multiplyMatrix(
					Lib3dMath.Transforms.rotateY( angle ) );

	if( angle > Math.PI * 2 ) {
		angle = 0.0;
	}
	else {
		angle += 0.01;
	}

	shaders.objectShader.prepare([
		//{ name: Uniform.texture, value: 0 },
		{ name: Uniform.projectionMatrix, transpose: false, value: perspectiveMatrix },
		{ name: Uniform.modelView, transpose: false, value: modelView },
		//{ name: Uniform.normalMatrix, transpose: false, value: normalMatrix },
	]);

	for( var key in objects ) {
		var o = objects[ key ];
		o.render( shaders.objectShader );
	}

	gl.flush();
	gfx.requestAnimationFrame( render );
	delta = gfx.frameDelta( now );
	//gfx.printFrameRate( delta );
};
*/


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
		{ type: gl.VERTEX_SHADER, url:   "assets/shaders/spinning-triangle-100.v-glsl" },
		{ type: gl.FRAGMENT_SHADER, url: "assets/shaders/spinning-triangle-100.f-glsl" },
	], [
		{ name: Attribute.vertex, variable: "a_vertex" },
		{ name: Attribute.color, variable: "a_color" },
	], [
		{ name: Uniform.modelView, variable: "u_model_view" },
	]);

var spinning_triangle = () => {
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	//var projectionMatrix = Lib3dMath.Matrix4.IDENTITY;
	var projectionMatrix = Lib3dMath.Projections.orthographic( -2 * gfx.getAspectRatio(), 2 * gfx.getAspectRatio(), -2, 2, -10, 10 );
	var transform = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0, 0, -2) ).multiplyMatrix( Lib3dMath.Transforms.rotateZ( angle ) );
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
		{ name: Uniform.modelView, transpose: false, value: modelView },
	], false);

	//console.info( "Projection:\n" + projectionMatrix );
	//console.info( "Model View:\n" + modelView );

	gl.bindBuffer( gl.ARRAY_BUFFER, vboTriangle );
	this.gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.vertex, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0 );
	this.gfx.assertNoError( );
	gl.vertexAttribPointer( triangle_shader.attributes.color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3 );
	this.gfx.assertNoError( );

	gl.drawArrays( gl.POINTS, 0, vboTriangle.count );
	this.gfx.assertNoError( );

	gl.flush();
	gfx.requestAnimationFrame( spinning_triangle );
	delta = gfx.frameDelta( now );
	//gfx.printFrameRate( delta );
};

spinning_triangle();


//gfx.render( d );
