import { GFX, Lib3dMath, Attribute, Uniform, Shader } from './lib/gfx.js';
import { OceanFloorModel } from '../assets/models/oceanfloor.js';
import { UnderwaterBaseModel } from '../assets/models/underwater-base.js';
import { SubmarineModel } from '../assets/models/sub.js';
import { LightstandModel } from '../assets/models/lightstand.js';

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

        let mv = gfx.cameraView.multiply( Lib3dMath.Transforms.rigidBodyTransform( this.position, this.orientation, this.scale ) );

        gfx.shaders.objectShader.prepare([
            { name: "useTexture", value: 1 },
            { name: Uniform.color, value: new Lib3dMath.Vector4(1.0, 1.0, 1.0, 1.0) },
            { name: Uniform.texture0, value: 0 },
            { name: Uniform.texture1, value: 1 },
            { name: Uniform.projectionMatrix, transpose: false, value: gfx.perspectiveMatrix },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: false, value: gfx.normalMatrix },
        ]);

        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, this.texture );

        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_2D, this.gfx.causticTextures[ this.gfx.caustic ] );

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

        let mv = gfx.cameraView.multiply( Lib3dMath.Transforms.rigidBodyTransform( this.position, this.orientation, this.scale ) );

        gfx.shaders.objectShader.prepare([
            { name: "useTexture", value: 1 },
            { name: Uniform.color, value: new Lib3dMath.Vector4(1.0, 1.0, 1.0, 1.0) },
            { name: Uniform.texture0, value: 0 },
            { name: Uniform.texture1, value: 1 },
            { name: Uniform.projectionMatrix, transpose: false, value: gfx.perspectiveMatrix },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: false, value: gfx.normalMatrix },
        ]);

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

        shader.prepare([
            { name: "useTexture", value: 0 },
            { name: Uniform.color, value: new Lib3dMath.Vector4(0.7372549, 0.83921569, 1.0, 0.05) },
        ]);


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

		//gl.enable( gl.BLEND );
		gl.depthMask( false );
        gl.drawArrays( gl.TRIANGLES, 0, this.vboGlass.itemCount );
		gl.depthMask( true );
		//gl.disable( gl.BLEND );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.normal );
        gl.disableVertexAttribArray( shader.attributes.textureCoord );
    }
};

let submarine = {
	create: function(gfx) {
        this.gfx = gfx;
        var gl = gfx.getContext();

        this.vboHull           = gfx.bufferCreate( new Float32Array(SubmarineModel.hull), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboHull.itemSize  = 8;
        this.vboHull.itemCount = SubmarineModel.hull.length / 8;

        this.vboDivePlane           = gfx.bufferCreate( new Float32Array(SubmarineModel.divePlane), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboDivePlane.itemSize  = 8;
        this.vboDivePlane.itemCount = SubmarineModel.divePlane.length / 8;

        this.vboLeftProp           = gfx.bufferCreate( new Float32Array(SubmarineModel.leftProp), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboLeftProp.itemSize  = 8;
        this.vboLeftProp.itemCount = SubmarineModel.leftProp.length / 8;

        this.vboRightProp           = gfx.bufferCreate( new Float32Array(SubmarineModel.rightProp), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboRightProp.itemSize  = 8;
        this.vboRightProp.itemCount = SubmarineModel.rightProp.length / 8;

        this.vboLeftTorpedo           = gfx.bufferCreate( new Float32Array(SubmarineModel.leftTorpedo), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboLeftTorpedo.itemSize  = 8;
        this.vboLeftTorpedo.itemCount = SubmarineModel.leftTorpedo.length / 8;

        this.vboRightTorpedo           = gfx.bufferCreate( new Float32Array(SubmarineModel.rightTorpedo), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboRightTorpedo.itemSize  = 8;
        this.vboRightTorpedo.itemCount = SubmarineModel.rightTorpedo.length / 8;
	},
	render: function(shader) {
        var gl = this.gfx.getContext();

        let mv = gfx.cameraView.multiply( Lib3dMath.Transforms.rigidBodyTransform( this.position, this.orientation, this.scale ) );
		
		let l = new Lib3dMath.Vector3( mv.m[ 0], mv.m[ 1], mv.m[ 2] );
		l.normalize();
		let u = new Lib3dMath.Vector3( mv.m[ 4], mv.m[ 5], mv.m[ 6] );
		l.normalize();
		let f = new Lib3dMath.Vector3( mv.m[ 8], mv.m[ 9], mv.m[10] );
		f.normalize();
		let normalMatrix = new Lib3dMath.Matrix3(
			l.x, l.y, l.z,
			u.x, u.y, u.z,
			f.x, f.y, f.z
		);
		normalMatrix.invert();

        gfx.shaders.objectShader.prepare([
            { name: "useTexture", value: 1 },
            { name: Uniform.color, value: new Lib3dMath.Vector4(1.0, 1.0, 1.0, 1.0) },
            { name: Uniform.texture0, value: 0 },
            { name: Uniform.texture1, value: 1 },
            { name: Uniform.projectionMatrix, transpose: false, value: gfx.perspectiveMatrix },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: false, value: normalMatrix },
        ]);

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

        shader.prepare([
            { name: Uniform.color, value: new Lib3dMath.Vector4(0.95, 0.95, 0.95, 1.0) },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboDivePlane );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboDivePlane.itemCount );
        this.gfx.assertNoError( );

        let leftPropModelView = mv
					.multiply( Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(2.35,-2,3) ) )
					.multiply( Lib3dMath.Transforms.rotateZ( 100.0 * gfx.angle ) )
					.multiply( Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(-2.35,2,-3) ) );

		let inverseLeftPropModelView = Lib3dMath.Matrix4.fromMatrix(leftPropModelView);
		inverseLeftPropModelView.invert();

        shader.prepare([
            { name: Uniform.color, value: new Lib3dMath.Vector4(0.88, 0.88, 1.0, 1.0) },
            { name: Uniform.modelView, transpose: false, value: leftPropModelView },
            { name: Uniform.normalMatrix, transpose: false, value: inverseLeftPropModelView },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboLeftProp );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboLeftProp.itemCount );
        this.gfx.assertNoError( );

        let rightPropModelView = mv
					.multiply( Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(-2.35,-2,-3) ) )
					.multiply( Lib3dMath.Transforms.rotateZ( 180 + 100.0 * gfx.angle ) )
					.multiply( Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(2.35,2,3) ) );

        shader.prepare([
            { name: Uniform.color, value: new Lib3dMath.Vector4(0.88, 0.88, 1.0, 1.0) },
            { name: Uniform.modelView, transpose: false, value: rightPropModelView },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboRightProp );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboRightProp.itemCount );
        this.gfx.assertNoError( );

        shader.prepare([
            { name: Uniform.color, value: new Lib3dMath.Vector4(1.0, 0.70, 0.70, 1.0) },
            { name: Uniform.modelView, transpose: false, value: mv },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboLeftTorpedo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboLeftTorpedo.itemCount );
        this.gfx.assertNoError( );


        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboRightTorpedo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboRightTorpedo.itemCount );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.normal );
        gl.disableVertexAttribArray( shader.attributes.textureCoord );
	}
};

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
    underwaterBase.orientation = Lib3dMath.Transforms.rotateY(-45.0);
    underwaterBase.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1.3, 1.3) );
    underwaterBase.create(gfx);
    //gfx.objects.push(underwaterBase);


    submarine.texture     = hullTexture;
    //submarine.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0,10,-18) );
    submarine.position    = Lib3dMath.Transforms.translate( new Lib3dMath.Vector3(0,10,0) );
    submarine.orientation = Lib3dMath.Transforms.rotateY(90.0);
    //submarine.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(0.5, 0.5, 0.5) );
    submarine.scale       = Lib3dMath.Transforms.scale( new Lib3dMath.Vector3(1.3, 1.3, 1.3) );
    submarine.create(gfx);
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

var render = (gfx) => {
    let gl = gfx.getContext();
	let now = gfx.now();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    oceanBackground.render();

    var position = new Lib3dMath.Vector3(20.0, 10.0, 50.0);
	gfx.perspectiveMatrix = Lib3dMath.Projections.perspective( Lib3dMath.Core.toRadians(50.0), gfx.getAspectRatio(), 0.1, 10000.0 );
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
		//gfx.angle += 0.00005 * gfx.delta;
		gfx.angle += 0.0001 * gfx.delta;
	}

	if( now >= (gfx.lastCausticUpdate + gfx.causticUpdateFreq) ) {
		gfx.caustic = ( gfx.caustic + 1 ) % 32;
		gfx.lastCausticUpdate = now;
	}

	gfx.shaders.objectShader.use();

	for( let key in gfx.objects ) {
		let o = gfx.objects[ key ];
		o.render( gfx.shaders.objectShader );
	}

	gl.flush();
	gfx.delta = gfx.frameDelta( now );
	//gfx.printFrameRate( gfx.delta );
};

gfx.initialize( setup );
gfx.render( render );
