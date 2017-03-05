import { GFX, Lib3dMath, Attribute, Uniform, Shader } from './lib/gfx.js';

import { Background } from './background.js';
import { OceanFloor } from './oceanfloor.js';
import { UnderwaterBase } from './underwaterbase.js';
import { Submarine } from './submarine.js';

if( !GFX.isSupported() ) {
	throw "GFX is not supported!";
}

var canvas = document.getElementById('gfx');
var attributes = {
	alpha: true,
	depth: true,
	stencil: false,
	antialias: true,
	premultipliedAlpha: false,
	preserveDrawingBuffer: false,
};

var gfx = new GFX(canvas, attributes);
let oceanBackground = new Background(gfx);

var setup = (gfx) => {
    gfx.angle             = 0;
    gfx.delta             = 0;
    gfx.shaders           = {};
    gfx.objects           = [];
    gfx.caustic           = 0;
    gfx.causticUpdateFreq = 60;
	gfx.lastCausticUpdate = gfx.now();

    let gl = gfx.getContext();
    gfx.printInfo();

    gfx.resize(true);

    gl.enable( gl.DEPTH_TEST );
    gl.clearDepth(1.0);                 // Clear everything
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.enable( gl.CULL_FACE );
    gl.cullFace( gl.BACK );
    gl.frontFace( gl.CCW );

    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gfx.assertNoError();

    gl.clearColor( 0, 0, 0, 0 );

    gfx.shaders["backgroundShader"] = gfx.glslProgramObject(
            [ // shaders
                { type: gl.VERTEX_SHADER, url: "assets/shaders/background-100.v.glsl" },
                { type: gl.FRAGMENT_SHADER, url: "assets/shaders/background-100.f.glsl" },
            ],
            [ // attributes
                { name: Attribute.vertex, variable: "a_vertex" },
                { name: Attribute.color, variable: "a_color" },
            ],
            [] // uniforms
    );

    gfx.shaders["objectShader"] = gfx.glslProgramObject(
            [ // shaders
                { type: gl.VERTEX_SHADER, url: "assets/shaders/object-100.v.glsl" },
                { type: gl.FRAGMENT_SHADER, url: "assets/shaders/object-100.f.glsl" },
            ],
            [ // attributes
                { name: Attribute.vertex, variable: "a_vertex" },
                { name: Attribute.normal, variable: "a_normal" },
                { name: Attribute.textureCoord, variable: "a_tex_coord" },
            ],
            [ // uniforms
            	{ name: "useTexture", variable: "u_use_texture" },
                { name: Uniform.color, variable: "u_color" },
                { name: Uniform.projectionMatrix, variable: "u_projection" },
                { name: Uniform.modelView, variable: "u_model_view" },
                { name: Uniform.normalMatrix, variable: "u_normal_matrix" },
                { name: Uniform.texture0, variable: "u_texture" },
                { name: Uniform.texture1, variable: "u_caustic" },
                { name: "lightDirection", variable: "u_light_direction" },
                { name: "lightColor", variable: "u_light_color" },
            ]
    );

	let oceanFloor         = new OceanFloor(gfx);
    oceanFloor.texture     = gfx.loadTexture2D( "assets/textures/oceanfloor.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );
    oceanFloor.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0,0,0) );
    oceanFloor.orientation = Lib3dMath.Matrix4.IDENTITY;
    oceanFloor.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1, 1.3) );
    gfx.objects.push(oceanFloor);

    let hullTexture = gfx.loadTexture2D( "assets/textures/hull.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );

	let underwaterBase         = new UnderwaterBase(gfx);
    underwaterBase.texture     = hullTexture;
    underwaterBase.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(8,-10,0) );
    underwaterBase.orientation = Lib3dMath.Transforms.rotateY(-45.0);
    underwaterBase.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1.3, 1.3) );
    gfx.objects.push(underwaterBase);


	let submarine         = new Submarine(gfx);
    submarine.texture     = hullTexture;
    submarine.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0,10,-18) );
    submarine.orientation = Lib3dMath.Transforms.rotateY(0.0);
    submarine.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(0.5, 0.5, 0.5) );
    gfx.objects.push(submarine);

	gfx.causticTextures = [];

	let number_formatter = (num, length) => {
		var r = "" + num;
		while (r.length < length) {
			r = "0" + r;
		}
		return r;
	};

	for( let i = 1; i <= 32; i++ )
	{
    	let texture = gfx.loadTexture2D( "assets/textures/caustics/caustics_" + number_formatter(i, 3) + ".png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );
		gfx.causticTextures.push(texture);
	}

    console.info( "WebGL context initialized" );
};

const LIGHT_DIRECTION = (new Lib3dMath.Vector3(0.2, 1, 0.3)).normalize();
const LIGHT_COLOR     = new Lib3dMath.Vector3(1.4, 1.4, 1.5);

var render = (gfx) => {
    let gl = gfx.getContext();
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    let oceanBackgroundShader = this.gfx.shaders.backgroundShader;
    oceanBackground.render(oceanBackgroundShader);

    var position = new Lib3dMath.Vector3(20.0, 10.0, 50.0);
    //var position = new Lib3dMath.Vector3(-20.0, 10.0, 50.0);
	gfx.perspectiveMatrix = Lib3dMath.Projections.perspective( Lib3dMath.Core.toRadians(55.0), gfx.getAspectRatio(), 0.1, 1000.0 );
	gfx.cameraView = Lib3dMath.Transforms.lookAt( position, new Lib3dMath.Vector3(0, 8, 0), Lib3dMath.Vector3.YUNIT ).multiply(Lib3dMath.Transforms.rotateY( gfx.angle ) );
	//gfx.cameraView = Lib3dMath.Transforms.translate( position ).multiply(Lib3dMath.Transforms.rotateY( gfx.angle ) );
    gfx.normalMatrix = new Lib3dMath.Matrix3(
        gfx.cameraView.m[ 0], gfx.cameraView.m[ 1], gfx.cameraView.m[ 2],
        gfx.cameraView.m[ 4], gfx.cameraView.m[ 5], gfx.cameraView.m[ 6],
        gfx.cameraView.m[ 8], gfx.cameraView.m[ 9], gfx.cameraView.m[10]
    );
    gfx.normalMatrix.invert();

	if( gfx.angle > Math.PI * 2 ) {
		gfx.angle = 0.0;
	}
	else {
		gfx.angle += 0.00005 * gfx.delta;
		//gfx.angle += 0.0001 * gfx.delta;
	}

	if( now >= (gfx.lastCausticUpdate + gfx.causticUpdateFreq) ) {
		gfx.caustic = ( gfx.caustic + 1 ) % 32;
		gfx.lastCausticUpdate = now;
	}

	gfx.shaders.objectShader.use();

	gfx.shaders.objectShader.prepare([
		{ name: "lightDirection", value: LIGHT_DIRECTION },
		{ name: "lightColor", value: LIGHT_COLOR }
	]);

	for( let key in gfx.objects ) {
		let o = gfx.objects[ key ];
		o.render( gfx.shaders.objectShader );
		o.update( gfx.delta );
	}

	gl.flush();
	gfx.delta = gfx.frameDelta( now );
	//gfx.printFrameRate( gfx.delta );
};

gfx.initialize( setup );
gfx.render( render );
