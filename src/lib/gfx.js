import m3d from './m3d.js';


export class Color {
	constructor(r, g, b, a) {
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
		this.a = a || 0;
	}

	static red() {
		return new Color( 1, 0, 0, 1 );
	}

	static green() {
		return new Color( 0, 1, 0, 1 );
	}

	static blue() {
		return new Color( 0, 0, 1, 1 );
	}

	static white() {
		return new Color( 1, 1, 1, 1 );
	}

	static black() {
		return new Color( 0, 0, 0, 1 );
	}
}

export const Attribute = {
	vertex: "vertex",
	normal: "normal",
	textureCoord: "textureCoord",
	color: "color"
};

export const Uniform = {
	projectionMatrix: "projectionMatrix",
	modelView: "modelView",
	normalMatrix: "normalMatrix",
	color: "color",
	materialDiffuse: "materialDiffuse",
	materialSpecular: "materialSpecular",
	texture0: "texture0",
	texture1: "texture1",
	texture2: "texture2",
	texture3: "texture3",
	texture4: "texture4",
	texture5: "texture5"
};

export class Shader {
	constructor(gfx, program, attributes, uniforms ) {
		this.gfx = gfx;
		this.program = program;
		this.attributes = {};
		this.uniforms = {};

		for( let key in attributes ) {
			let attributeDesc = attributes[ key ];
			this.attributes[ attributeDesc.name ] = gfx.glslBindAttribute( program, attributeDesc.variable );
			console.log( "[GFX] Binded attribue " + attributeDesc.name + " (variable '" + attributeDesc.variable + "') with location " + this.attributes[ attributeDesc.name ] );
		}

		for( let key in uniforms ) {
			let uniformDesc = uniforms[ key ];
			this.uniforms[ uniformDesc.name ] = gfx.glslBindUniform( program, uniformDesc.variable );
			console.log( "[GFX] Binded uniform " + uniformDesc.name + " (variable '" + uniformDesc.variable + "')" );
			//console.log( "[GFX] Binded uniform " + uniformDesc.name + " (variable '" + uniformDesc.variable + "') with location " + this.uniforms[ uniformDesc.name ] );
		}
	}

	use() {
		let gl = this.gfx.getContext();
		gl.useProgram( this.program );
	}

	attributes() {
		return this.attributes;
	}

	uniforms() {
		return this.uniforms;
	}

	/*
		prepare( [
			{ name: Uniform.texture, value: 0 },
			{ name: Uniform.projectionMatrix, transpose: false, value: perspectiveMatrix },
			{ name: Uniform.normalMatrix, transpose: false, value: perspectiveMatrix },
		]);
	 */
	prepare( uniformValues = [], debug = false ) {
		let gl = this.gfx.getContext();

		for( let key in this.attributes ) {
			gl.enableVertexAttribArray( this.attributes[ key ] );
			this.gfx.assertNoError();
		}

		for( let key in uniformValues ) {
			let uniformValueDesc = uniformValues[ key ];
			let name = uniformValueDesc.name;
			let val  = uniformValueDesc.value;
			let uniformLoc = this.uniforms[ name ];

			if( !uniformLoc ) {
				throw "[GFX] Bad uniform location!";
			}

			if( typeof(val) == "number" ) {
                if( Number.isInteger(val) ) {
				    if( debug ) console.log( "[GFX] Setting integer uniform " + name + " with value: " + val );
				    gl.uniform1i( uniformLoc, val );
                }
                else {
				    if( debug ) console.log( "[GFX] Setting float uniform " + name + " with value: " + val );
				    gl.uniform1f( uniformLoc, val );
                }
				this.gfx.assertNoError();
			}
			else if( val instanceof GFX.Math.Vector3 ) {
				if( debug ) console.log( "[GFX] Setting vector3 uniform " + name + " with value: " + val );
				gl.uniform3fv( uniformLoc, new Float32Array([val.x, val.y, val.z]) );
				this.gfx.assertNoError();
			}
			else if( val instanceof GFX.Math.Vector4 ) {
				if( debug ) console.log( "[GFX] Setting vector4 uniform " + name + " with value: " + val );
				gl.uniform4fv( uniformLoc, new Float32Array([val.x, val.y, val.z, val.w]) );
				this.gfx.assertNoError();
			}
			else if( val instanceof GFX.Math.Matrix3 ) {
				let tr = uniformValueDesc.transpose;
				if( tr ) {
					val.transpose();
				}
				if( debug ) console.log( "[GFX] Setting matrix3 uniform " + name + " with" + (tr ? " transposed" : "") + " value:\n" + val );
				gl.uniformMatrix3fv( uniformLoc, false, new Float32Array(val.m) );
				this.gfx.assertNoError();
			}
			else if( val instanceof GFX.Math.Matrix4 ) {
				let tr = uniformValueDesc.transpose;
				if( tr ) {
					val.transpose();
				}
				if( debug ) console.log( "[GFX] Setting matrix4 uniform " + name + " with" + (tr ? " transposed" : "") + " value:\n" + val );
				gl.uniformMatrix4fv( uniformLoc, false, new Float32Array(val.m) );
				this.gfx.assertNoError();
			}
			else {
				throw "[GFX] Bad uniform value!";
			}
		}
	}
}

export class GFX {
	static get Math() {
		return {
			Core:        m3d,
			Transforms:  m3d.transforms,
			Projections: m3d.transforms.projections,
			Vector2:     m3d.Vec2,
			Vector3:     m3d.Vec3,
			Vector4:     m3d.Vec4,
			Matrix2:     m3d.Mat2,
			Matrix3:     m3d.Mat3,
			Matrix4:     m3d.Mat4,
			Quaternion:  m3d.Quat,
		};
	}

	constructor(canvas, attributes) {
		if( !attributes ) {
			// load defaults
			attributes = {
				alpha: true,
				depth: true,
				stencil: true,
				antialias: false,
				premultipliedAlpha: false,
				preserveDrawingBuffer: false,
			};
		}

		let timer = () => {
			let t = null;
			if (window.performance.now) {
				t = function() { return window.performance.now(); };
			}
			else {
				if (window.performance.webkitNow) {
					t = function() { return window.performance.webkitNow(); };
				}
				else {
					t = function() { return new Date().getTime(); };
				}
			}
			return t;
		};

		this.gl = canvas.getContext('webgl2', attributes) ||
                  canvas.getContext('webgl', attributes) ||
                  canvas.getContext('experimental-webgl', attributes);
		if( !this.gl ) {
			throw "Bad WebGL context.";
		}
		this.now = timer();

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
	}

	static isSupported() {
		let canvas = document.createElement('canvas');
		try {
			let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		} catch (e) {
			return false;
		}
		return true;
	}

	requestAnimationFrame( func ) {
		window.requestAnimationFrame( func );
	}

    initialize( setup_func ) {
        let gfx_instance = this;
        this.gl.canvas.addEventListener( "webglcontextlost", (event) => {
            console.log( "[GFX] Context lost." );
            event.preventDefault();
        }, false);
        this.gl.canvas.addEventListener( "webglcontextrestored", (event) => {
            console.log( "[GFX] Context restored." );
            setup_func(gfx_instance);
        }, false);

        setup_func(this);
    }

	render( render_func ) {
		render_func(this);
		window.requestAnimationFrame( this.render.bind(this, render_func) );
	}

    run( initialization, render ) {
        this.initialize( initialization );
        this.render( render );
    }

	assertNoError() {
		let err = this.gl.getError();
		let errorStrings = {};

		errorStrings[ this.gl.NO_ERROR ]                      = "No error";
		errorStrings[ this.gl.OUT_OF_MEMORY ]                 = "Out of memory";
		errorStrings[ this.gl.INVALID_ENUM ]                  = "Invalid enum";
		errorStrings[ this.gl.INVALID_OPERATION ]             = "Invalid operation";
		errorStrings[ this.gl.INVALID_FRAMEBUFFER_OPERATION ] = "Invalid framebuffer operation";
		errorStrings[ this.gl.INVALID_VALUE ]                 = "Invalid value";
		errorStrings[ this.gl.CONTEXT_LOST_WEBGL ]            = "Context lost WebGL";

		if( err != this.gl.NO_ERROR ) {
		    if( err != this.gl.CONTEXT_LOST_WEBGL || !this.initialization_fxn ) {
			    throw "[GFX] Error (" + errorStrings[err] + ")";
            }
		}
	}

	static validateArgs(functionName, args) {
		for (var ii = 0; ii < args.length; ++ii) {
			if (args[ii] === undefined) {
				console.error("[GFX] Argument is undefined in " + functionName + ".");
			}
		}
	}

	getContext() {
		return this.gl;
	}

	getCanvas() {
		return this.gl.canvas;
	}

	getWidth() {
		return this.gl.canvas.offsetWidth;
	}

	getHeight() {
		return this.gl.canvas.offsetHeight;
	}

	getAspectRatio() {
		return this.getWidth() / this.getHeight();
	}

	getVendor() {
		let vendor = this.gl.getParameter( this.gl.VENDOR );
		return vendor ? vendor : "unknown";
	}

	getRenderer() {
		let renderer = this.gl.getParameter( this.gl.RENDERER );
		return renderer ? renderer : "unknown";
	}

	getVersion() {
		let version = this.gl.getParameter( this.gl.VERSION );
		return version ? version : "unknown";
	}

	getShaderVersion( gl ) {
		let glslVersion = this.gl.getParameter( this.gl.SHADING_LANGUAGE_VERSION );
		return glslVersion ? glslVersion : "unknown";
	}

	printInfo() {
		console.log( "[GFX] Vendor: " + this.getVendor() );
		console.log( "[GFX] Renderer: " + this.getRenderer() );
		console.log( "[GFX] Version: " + this.getVersion() );
		console.log( "[GFX] Shading Language: " + this.getShaderVersion() );
	}

	frameDelta( now /* milliseconds */ ) {
		if( typeof this.frameDelta.last_render == 'undefined' ) {
			this.frameDelta.last_render = 0;
		}
		let delta = now - this.frameDelta.last_render;
		this.frameDelta.last_render = now;
		return delta;
	}

	frameRate( delta /*milliseconds*/ ) {
		if( typeof this.frameRate.last_time1 == 'undefined' ) {
			this.frameRate.last_time1 = 0;
		}
		if( typeof this.frameRate.last_time2 == 'undefined' ) {
			this.frameRate.last_time2 = 0;
		}

		delta = (0.6 * delta + 0.3 * this.frameRate.last_time1 + 0.1 * this.frameRate.last_time2);

		this.frameRate.last_time2 = this.frameRate.last_time1;
		this.frameRate.last_time1 = delta;

		return 1000.0 / delta;
	}

	printFrameRate( delta /*milliseconds*/ ) {
		if( typeof this.printFrameRate.frame_rate_call_count == 'undefined' ) {
			this.printFrameRate.frame_rate_call_count = 0;
		}
		if( this.printFrameRate.frame_rate_call_count > 60 ) {
			this.printFrameRate.frame_rate_call_count = 0;
			console.log( "[GFX] fps: " + this.frameRate( delta ).toFixed(1) );
		}
		this.printFrameRate.frame_rate_call_count += 1;
	}

	bufferCreate( buffer, target, usage ) {
		GFX.validateArgs( this.bufferCreate.name, arguments );
		let bufferObject = this.gl.createBuffer();
		if( bufferObject ) {
			this.gl.bindBuffer( target, bufferObject );
			this.gl.bufferData( target, buffer, usage );
			this.assertNoError()
		}
		else {
			console.error( "[GFX] Unable to create buffer." );
			throw "Unable to create buffer."
		}
		return bufferObject;
	}

	bufferDestroy( bufferObject ) {
		GFX.validateArgs( this.bufferDestroy.name, arguments );
		if( this.gl.isBuffer( bufferObject ) ) {
			this.gl.deleteBuffer( bufferObject );
			this.assertNoError()
		}
	}

	floatBufferCreate( buffer, size, count, usage ) {
		let result = this.bufferCreate( new Float32Array(buffer), this.gl.ARRAY_BUFFER, usage );
		result.size = size;
		result.count = count;
		return result;
	}

	indexBufferCreate(buffer, count, usage ) {
		let result = this.bufferCreate( new Uint16Array(buffer), this.gl.ELEMENT_ARRAY_BUFFER, usage );
		result.count = count;
		return result;
	}

	glslCompileShader( type, source ) {
		GFX.validateArgs( this.glslCompileShader.name, arguments );
		let shader = this.gl.createShader( type );
		if( !shader ) {
			console.error( "[GFX] Unable to create GLSL shader." );
			throw "Unable to create GLSL shader.";
		}

		this.gl.shaderSource( shader, source );
		this.gl.compileShader( shader );

		let compileStatus = this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS );

		if( !compileStatus ) {
			let log = this.gl.getShaderInfoLog( shader );
			if( log ) {
				console.log( "[GFX] " + log );
			}
			this.gl.deleteShader( shader );
			throw "GLSL Compilation Error";
		}

		return shader;
	}

	glslBindAttribute( program, name ) {
		GFX.validateArgs( this.glslBindAttribute.name, arguments );
		let loc = this.gl.getAttribLocation( program, name );

		if( loc < 0 || loc == null || loc == undefined) {
			console.error( "[GLSL] Unable to bind to attribute " + name + "'" );
			throw "Unable to bind to attribute.";
		}

		return loc;
	}

	glslBindUniform( program, name ) {
		GFX.validateArgs( this.glslBindUniform.name, arguments );
		let loc = this.gl.getUniformLocation( program, name );

		if( loc < 0 || loc == null || loc == undefined) {
			throw "[GFX] Unable to bind to uniform.";
		}

		return loc;
	}

	/*
	 *  let shaders = [
	 *     { type: gl.VERTEX_SHADER, url: "assets/shaders/cube-100.v.glsl" },
	 *     { type: gl.FRAGMENT_SHADER, url: "assets/shaders/cube-100.f.glsl" },
	 *  ];
	 */
	glslProgramFromShaders( shaders, markForDeletion ) {
		GFX.validateArgs( this.glslProgramFromShaders.name, arguments );
		let shaderObjects     = [];
		let isCompilationGood = true;

		// compiled all of the shaders
		for( let key in shaders ) {
			let shaderInfo = shaders[ key ];
			let source = this.loadStringFromUrl( shaderInfo.url );

			try {
				let shader = this.glslCompileShader( shaderInfo.type, source );
				shaderObjects.push( shader );
			}
			catch( e ) {
				isCompilationGood = false;
				break;
			}

			console.log("[GFX] Shader compiled: " + shaderInfo.url);
		}

		if( !isCompilationGood ) {
			for( let key in shaderObjects ) {
				let shader = shaderObjects[ key ];
				this.gl.deleteShader( shader );
			}
			throw "[GFX] GLSL Compilation Error";
		}

		let program = this.gl.createProgram();
		if( !program ) {
			throw "[GFX] Unable to create GLSL program.";
		}

		for( let key in shaderObjects ) {
			let shader = shaderObjects[ key ];
			this.gl.attachShader( program, shader );
		}

		this.gl.linkProgram( program );
		let linkingStatus = this.gl.getProgramParameter( program, this.gl.LINK_STATUS );

		if( linkingStatus ) {
			console.log("[GFX] Shader linked.");
		}
		else {
			let log = this.gl.getProgramInfoLog( shader );
			if( log ) {
				console.log( "[GFX] " + log );
			}
			this.gl.deleteProgram( program );

			throw "[GFX] GLSL Linking Error";
		}

		if( markForDeletion ) {
			console.log("[GFX] Shaders will be destroyed automatically.");
			// All attached shaders will be deleted when
			// deleteProgram() is called on the program
			// object.
			for( let key in shaderObjects ) {
				let shader = shaderObjects[ key ];
				this.gl.deleteShader( shader );
			}
		}

		return program;
	}

	/*
	 * var attributes = [
	 *    { name: "vertex", variable: "a_vertex" },
	 *    { name: "normal", variable: "a_normal" },
	 *    { name: "textureCoord", variable: "a_tex_coord" },
	 * ];
	 *
	 * var uniforms = [
	 *    { name: "projectionMatrix", variable: "u_projection" },
	 *    { name: "modelView", variable: "u_model_view" },
	 *    { name: "normalMatrix", variable: "u_normal_matrix" },
	 *    { name: "texture", variable: "u_texture" },
	 * ];
	 */
	glslProgramObject( shaderAssets, attributes, uniforms ) {
		GFX.validateArgs( this.glslProgramObject.name, arguments );
		let shaderProgram = this.glslProgramFromShaders( shaderAssets, false );
		var gl = this.getContext();
		return new Shader( this, shaderProgram, attributes, uniforms );
	}

	loadStringFromUrl(url, callback) {
		let async = (callback != null && callback != undefined);

		let xmlhttp = window.XMLHttpRequest ?
					  new XMLHttpRequest() : /* Modern browsers */
					  new ActiveXObject("Microsoft.XMLHTTP");


		let result = null;
		xmlhttp.onreadystatechange = function() {
			if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {

				if( async ) {
					result = callback( xmlhttp.responseText );
				}
				else {
					result = xmlhttp.responseText;
				}
			}
		};

		xmlhttp.open( "GET", url, async );
		xmlhttp.send( );

		return result;
	}

    loadTexture2D( url, min_filter = null, mag_filter = null, wrap_s = null, wrap_t = null ) {
        let gl = this.getContext();
        let generate_mipmaps = false;

        if( !min_filter ) {
            min_filter = gl.NEAREST;
        }
        if( !mag_filter ) {
            mag_filter = gl.LINEAR;
        }
        if( !wrap_s ) {
            wrap_s = gl.CLAMP_TO_EDGE;
        }
        if( !wrap_t ) {
            wrap_t = gl.CLAMP_TO_EDGE;
        }

        switch( min_filter )
        {
            case gl.NEAREST_MIPMAP_LINEAR:
            case gl.NEAREST_MIPMAP_NEAREST:
            case gl.LINEAR_MIPMAP_LINEAR:
            case gl.LINEAR_MIPMAP_NEAREST:
                generate_mipmaps = true;
                break;
            default:
                break;
        }

        /* Only GL_LINEAR and GL_NEAREST are valid magnification filters */
        switch( mag_filter )
        {
            case gl.NEAREST_MIPMAP_LINEAR:
            case gl.NEAREST_MIPMAP_NEAREST:
                mag_filter = gl.NEAREST;
                break;
            case gl.LINEAR_MIPMAP_LINEAR:
            case gl.LINEAR_MIPMAP_NEAREST:
                mag_filter = gl.LINEAR;
                break;
            default:
                break;
        }

        var texture = gl.createTexture();
        var image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture( gl.TEXTURE_2D, texture );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filter );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t );

            if( generate_mipmaps )
            {
                if (!GFX.isPowerOf2(image.width) || !GFX.isPowerOf2(image.height)) {
                    throw "[GFX] Texture does not have power of two dimensions.";
                }
                else {
                    console.log( "[GFX] Generating mipmaps for texture: " + url );
                    gl.generateMipmap( gl.TEXTURE_2D );
                }
            }
        });

        return texture;
    }




    resize(setviewport = false) {
		let gl = this.getContext();
        let displayWidth  = gl.canvas.clientWidth;
        let displayHeight = gl.canvas.clientHeight;
        if( gl.canvas.width != displayWidth || gl.canvas.height != displayHeight ) {
            gl.canvas.width  = displayWidth;
            gl.canvas.height = displayHeight;
        }

        if( setviewport ) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }

    static isPowerOf2( n ) {
        return (n & (n - 1)) == 0;
    }
}
