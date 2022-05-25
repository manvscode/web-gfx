import { GFX, Attribute, Uniform, Shader } from './lib/gfx.js';

import { Background } from './background.js';
import { OceanFloor } from './oceanfloor.js';
import { UnderwaterBase } from './underwaterbase.js';
import { Submarine } from './submarine.js';

if( !GFX.isSupported() ) {
    throw "GFX is not supported!";
}

const canvas = document.getElementById('gfx');
const gfx = new GFX(canvas, {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
});
const oceanBackground = new Background(gfx);

const setup = (gfx) => {
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

    const oceanFloor       = new OceanFloor(gfx);
    oceanFloor.texture     = gfx.loadTexture2D( "assets/textures/oceanfloor.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );
    oceanFloor.position    = GFX.Math.Transforms.translate( new GFX.Math.Vector3(0,0,0) );
    oceanFloor.orientation = GFX.Math.Matrix4.IDENTITY;
    oceanFloor.scale       = GFX.Math.Transforms.scale( new GFX.Math.Vector3(1.3, 1, 1.3) );
    gfx.objects.push(oceanFloor);

    const hullTexture = gfx.loadTexture2D( "assets/textures/hull.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );

    const underwaterBase       = new UnderwaterBase(gfx);
    underwaterBase.texture     = hullTexture;
    underwaterBase.position    = GFX.Math.Transforms.translate( new GFX.Math.Vector3(8,-10,0) );
    underwaterBase.orientation = GFX.Math.Transforms.rotateY(-45.0);
    underwaterBase.scale       = GFX.Math.Transforms.scale( new GFX.Math.Vector3(1.3, 1.3, 1.3) );
    gfx.objects.push(underwaterBase);


    const submarine       = new Submarine(gfx);
    submarine.texture     = hullTexture;
    submarine.position    = GFX.Math.Transforms.translate( new GFX.Math.Vector3(0,10,-18) );
    submarine.orientation = GFX.Math.Transforms.rotateY(0.0);
    submarine.scale       = GFX.Math.Transforms.scale( new GFX.Math.Vector3(0.5, 0.5, 0.5) );
    gfx.objects.push(submarine);

    gfx.causticTextures = [];

    let number_formatter = (num, length) => {
        let r = "" + num;
        while (r.length < length) {
            r = "0" + r;
        }
        return r;
    };

    for( let i = 1; i <= 32; i++ )
    {
        const texture = gfx.loadTexture2D( "assets/textures/caustics/caustics_" + number_formatter(i, 3) + ".png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );
        gfx.causticTextures.push(texture);
    }

    console.info( "WebGL context initialized" );
};

const LIGHT_DIRECTION = (new GFX.Math.Vector3(0.2, 1, 0.3)).normalize();
const LIGHT_COLOR     = new GFX.Math.Vector3(1.4, 1.4, 1.5);

const render = (gfx) => {
    let gl = gfx.getContext();
    let now = gfx.now();
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    let oceanBackgroundShader = gfx.shaders.backgroundShader;
    oceanBackground.render(oceanBackgroundShader);

    let position = new GFX.Math.Vector3(20.0, 10.0, 50.0);
    //let position = new GFX.Math.Vector3(-20.0, 10.0, 50.0);
    gfx.perspectiveMatrix = GFX.Math.Projections.perspective( GFX.Math.Core.toRadians(65.0), gfx.getAspectRatio(), 1.0, 1000.0 );
    gfx.cameraView = GFX.Math.Transforms.lookAt( position, new GFX.Math.Vector3(0, 8, 0), GFX.Math.Vector3.YUNIT ).multiply(GFX.Math.Transforms.rotateY( gfx.angle ) );
    //gfx.cameraView = GFX.Math.Transforms.translate( position ).multiply(GFX.Math.Transforms.rotateY( gfx.angle ) );
    gfx.normalMatrix = new GFX.Math.Matrix3(
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


    // build shadow map







    // Render objects
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
