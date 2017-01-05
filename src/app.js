import { GFX, Lib3dMath, Attribute, Uniform, Shader } from './lib/gfx.js';
import { OceanFloorModel } from '../assets/models/oceanfloor.js';
import { UnderwaterBaseModel } from '../assets/models/underwater-base.js';

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

let oceanBackground = {
    create: function(gfx) {
        this.gfx = gfx;
        let gl = gfx.getContext();
        let bottomColor  = { R: 0.0, G: 0.0, B: 0.0 };
        let surfaceColor = { R: 0.0, G: 0.308803921568627, B: 0.508803921568627 };

        let rectangle = [ // two triangles
            -1, -1 + 0.9, 0, //position
            bottomColor.R, bottomColor.G, bottomColor.B,
            +1, -1 + 0.9, 0, //position
            bottomColor.R, bottomColor.G, bottomColor.B,
            -1, +1, 0, //position
            surfaceColor.R, surfaceColor.G, surfaceColor.B,
            +1, -1 + 0.9, 0, //position
            bottomColor.R, bottomColor.G, bottomColor.B,
            +1, +1, 0, //position
            surfaceColor.R, surfaceColor.G, surfaceColor.B,
            -1, +1, 0, //position
            surfaceColor.R, surfaceColor.G, surfaceColor.B
        ];

        this.vbo           = gfx.bufferCreate( new Float32Array(rectangle), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vbo.itemSize  = 6;
        this.vbo.itemCount = rectangle.length / this.vbo.itemSize;
        gfx.assertNoError( );
    },
    render: function() {
        let gl = this.gfx.getContext();
        let shader = this.gfx.shaders.backgroundShader;
	    shader.use();

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vbo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.color );
        gl.vertexAttribPointer( shader.attributes.color, 3, gl.FLOAT, false, this.vbo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.disable( gl.DEPTH_TEST );
        gl.drawArrays( gl.TRIANGLES, 0, this.vbo.itemCount );
        gl.enable( gl.DEPTH_TEST );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.color );
    }
};

let oceanFloor = {
    create: function(gfx) {
        this.gfx = gfx;
        var gl = gfx.getContext();

        // Stretch out the model along x-z plane by 130%
        //for( var i = 0; i < OceanFloorModel.OceanFloor.length; i += 8 )
        //{
            //OceanFloorModel.OceanFloor[ i + 0 ] *= 1.3;
            //OceanFloorModel.OceanFloor[ i + 2 ] *= 1.3;
        //}

        this.vbo           = gfx.bufferCreate( new Float32Array(OceanFloorModel.OceanFloor), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vbo.itemSize  = 8;
        this.vbo.itemCount = OceanFloorModel.OceanFloor.length / 8;
        gfx.assertNoError( );
    },
    render: function(shader) {
        var gl = this.gfx.getContext();

        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, this.texture );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vbo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vbo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vbo.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vbo.itemCount );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.normal );
        gl.disableVertexAttribArray( shader.attributes.textureCoord );
    }
};

let underwaterBase = {
    create: function(gfx) {
        this.gfx = gfx;
        var gl = gfx.getContext();

        this.vboHull           = gfx.bufferCreate( new Float32Array(UnderwaterBaseModel.underwaterbase), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboHull.itemSize  = 8;
        this.vboHull.itemCount = UnderwaterBaseModel.underwaterbase.length / 8;

        this.vboGlass           = gfx.bufferCreate( new Float32Array(UnderwaterBaseModel.glass), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboGlass.itemSize  = 8;
        this.vboGlass.itemCount = UnderwaterBaseModel.glass.length / 8;

        gfx.assertNoError( );
    },
    render: function(shader) {
        var gl = this.gfx.getContext();

        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, this.texture );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboHull );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboHull.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboHull.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboHull.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboHull.itemCount );
        this.gfx.assertNoError( );



        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboGlass );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboGlass.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboGlass.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboGlass.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboGlass.itemCount );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.normal );
        gl.disableVertexAttribArray( shader.attributes.textureCoord );
    }
};

var setup = (gfx) => {
    gfx.angle   = 0;
    gfx.delta   = 0;
    gfx.shaders = {};
    gfx.objects = [];

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
                { name: Uniform.projectionMatrix, variable: "u_projection" },
                { name: Uniform.modelView, variable: "u_model_view" },
                { name: Uniform.normalMatrix, variable: "u_normal_matrix" },
                { name: Uniform.texture, variable: "u_texture" },
            ]
    );

    oceanBackground.create(gfx);

    oceanFloor.texture     = gfx.loadTexture2D( "assets/textures/oceanfloor.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );
    oceanFloor.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0,0,0) );
    oceanFloor.orientation = Lib3dMath.Matrix4.IDENTITY;
    oceanFloor.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1, 1.3) );
    oceanFloor.create(gfx);
    gfx.objects.push(oceanFloor);

    let hullTexture = gfx.loadTexture2D( "assets/textures/hull.png", gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT );

    underwaterBase.texture     = hullTexture;
    underwaterBase.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(8,-10,0) );
    underwaterBase.orientation = Lib3dMath.Matrix4.IDENTITY;
    underwaterBase.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1.3, 1.3) );
    underwaterBase.create(gfx);
    gfx.objects.push(underwaterBase);


    console.info( "WebGL context initialized" );
};

var render = (gfx) => {
    let gl = gfx.getContext();
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    oceanBackground.render();

    var position = new Lib3dMath.Vector3(20.0, 10.0, 50.0);
	var perspectiveMatrix = Lib3dMath.Projections.perspective( Lib3dMath.Core.toRadians(50.0), gfx.getAspectRatio(), 0.1, 10000.0 );
	var modelView = Lib3dMath.Transforms.lookAt( position, new Lib3dMath.Vector3(0, 8, 0), Lib3dMath.Vector3.YUNIT ).multiply(Lib3dMath.Transforms.rotateY( gfx.angle ) );
	//var modelView = Lib3dMath.Transforms.translate( position ).multiply(Lib3dMath.Transforms.rotateY( gfx.angle ) );
    var normalMatrix = new Lib3dMath.Matrix3(
        modelView.m[ 0], modelView.m[ 1], modelView.m[ 2],
        modelView.m[ 4], modelView.m[ 5], modelView.m[ 6],
        modelView.m[ 8], modelView.m[ 9], modelView.m[10]
    );
    normalMatrix.invert();

	if( gfx.angle > Math.PI * 2 ) {
		gfx.angle = 0.0;
	}
	else {
		gfx.angle += 0.00005 * gfx.delta;
		//gfx.angle += 0.001 * gfx.delta;
	}

	gfx.shaders.objectShader.use();

	for( let key in gfx.objects ) {
		let o = gfx.objects[ key ];

        let mv = modelView.multiply( Lib3dMath.Transforms.rigidBodyTransform( o.position, o.orientation, o.scale ) );

        gfx.shaders.objectShader.prepare([
            { name: Uniform.texture, value: 0 },
            { name: Uniform.projectionMatrix, transpose: false, value: perspectiveMatrix },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: false, value: normalMatrix },
        ]);

		o.render( gfx.shaders.objectShader );
	}

	gl.flush();
	gfx.delta = gfx.frameDelta( now );
	//gfx.printFrameRate( gfx.delta );
};

gfx.initialize( setup );
gfx.render( render );
