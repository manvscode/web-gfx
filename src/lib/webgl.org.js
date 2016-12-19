/*
 *  Author: Joe Marrero.  manvscode@gmail.com
 */
"use strict";
var webgl = function() {


	function timer() {
		var t = null;
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
	}






	return {
		math: {
			core:        lib3dmath,
			transforms:  lib3dmath.transforms,
			projections: lib3dmath.transforms.projections,
			vector2:     lib3dmath.Vec2,
			vector3:     lib3dmath.Vec3,
			vector4:     lib3dmath.Vec4,
			matrix2:     lib3dmath.Mat2,
			matrix3:     lib3dmath.Mat3,
			matrix4:     lib3dmath.Mat4,
			quaternion:  lib3dmath.Quat,
		},

		glslCompileShader: function( gl, type, source ) {
			if( !gl ) {
				throw "Bad WebGL context.";
			}
			var shader = gl.createShader( type );
			if( !shader ) {
				throw "Unable to create GLSL shader.";
			}

			gl.shaderSource( shader, source );
			gl.compileShader( shader );

			var compileStatus = gl.getShaderParameter( shader, gl.COMPILE_STATUS );

			if( compileStatus == false ) {
				var log = gl.getShaderInfoLog( shader );
				console.log( "[WebGL] " + log );
				gl.deleteShader( shader );
				throw "GLSL Compilation Error";
			}

			return shader;
		},

		glslBindAttribute: function( gl, program, name ) {
			var loc = gl.getAttribLocation( program, name );

			if( loc < 0 ) {
				console.log( "[GLSL] Unable to bind to attribute '" + name + "'" );
				throw "Unable to bind to attribute.";
			}

			return loc;
		},

		glslBindUniform: function( gl, program, name ) {
			var loc = gl.getUniformLocation( program, name );

			if( loc < 0 ) {
				console.log( "[GLSL] Unable to bind to uniform '" + name + "'" );
				throw "Unable to bind to uniform.";
			}

			return loc;
		},

		/*
		 *  var shaders = [
		 *     { type: gl.VERTEX_SHADER, url: "assets/shaders/cube-100.v.glsl" },
		 *     { type: gl.FRAGMENT_SHADER, url: "assets/shaders/cube-100.f.glsl" },
		 *  ];
		 */
		glslProgramFromShaders: function( gl, shaders, markForDeletion ) {
			if( !gl ) {
				throw "Bad WebGL context.";
			}
			var shaderObjects     = [];
			var isCompilationGood = true;

			// compiled all of the shaders
			for( var key in shaders ) {
				var shaderInfo = shaders[ key ];
				var source = webgl.loadStringFromUrl( shaderInfo.url );

				try {
					var shader = webgl.glslCompileShader( gl, shaderInfo.type, source );
					shaderObjects.push( shader );
				}
				catch( e ) {
					isCompilationGood = false;
					break;
				}
			}

			if( !isCompilationGood ) {
				for( var shader in shaderObjects ) {
					gl.deleteShader( shader );
				}
				throw "GLSL Compilation Error";
			}

			var linkingStatus = true;
			var program       = gl.createProgram();

			if( !program ) {
				throw "Unable to create GLSL program.";
			}

			for( var key in shaderObjects ) {
				var shader = shaderObjects[ key ];
				gl.attachShader( program, shader );
			}

			gl.linkProgram( program );
			linkingStatus = gl.getProgramParameter( program, gl.LINK_STATUS );

			if( linkingStatus == false ) {
				var log = gl.getProgramInfoLog( shader );
				console.log( "[WebGL] " + log );
				gl.deleteProgram( program );

				throw "GLSL Linking Error";
			}

			if( markForDeletion ) {
				// All attached shaders will be deleted when
				// deleteProgram() is called on the program
				// object.
				for( var key in shaderObjects ) {
					var shader = shaderObjects[ key ];
					gl.deleteShader( shader );
				}
			}

			return program;
		},


		glslProgramObject: function( gl, shaderAssets, attributes, uniforms ) {
			var shaderProgram = webgl.glslProgramFromShaders( gl, shaderAssets, true );

			var programObject = {
				program: shaderProgram,
				attributes: {},
				uniforms: {},
				use: function() {
					gl.useProgram( this.program );
				},

				/*
					prepare( [
						{ uniform: objectShader.uniforms.texture, value: 0 },
						{ uniform: objectShader.uniforms.projectionMatrix, transpose: false, value: perspectiveMatrix },
						{ uniform: objectShader.uniforms.normalMatrix, transpose: false, value: perspectiveMatrix },
					]);
				 */
				prepare: function( uniformValues ) {
					for( var key in this.attributes ) {
						gl.enableVertexAttribArray( this.attributes[ key ] );
					}

					for( var key in uniformValues ) {
						var uniformValueDesc = uniformValues[ key ];
						var val = uniformValueDesc.value;

						if( val instanceof Number ) {
							gl.uniform1f( this.uniforms.uniform, val );
						}
						else if( val instanceof webgl.math.vector3 ) {
							gl.uniform3f( this.uniforms.uniform, [val.x, val.y, val.z] );
						}
						else if( val instanceof webgl.math.vector4 ) {
							gl.uniform3f( this.uniforms.uniform, [val.x, val.y, val.z, val.w] );
						}
						else if( val instanceof webgl.math.matrix3 ) {
							var tr = uniformValueDesc.transpose;
							gl.uniformMatrix3v( this.uniforms.uniform, tr, val.m );
						}
						else if( val instanceof webgl.math.matrix4 ) {
							var tr = uniformValueDesc.transpose;
							gl.uniformMatrix4v( this.uniforms.uniform, tr, val.m );
						}
					}
				},
			};

			for( var key in attributes ) {
				var attributeDesc = attributes[ key ];
				programObject.attributes[ attributeDesc.name ] = webgl.glslBindAttribute( gl, shaderProgram, attributeDesc.variable );
			}

			for( var key in uniforms ) {
				var uniformDesc = uniforms[ key ];
				programObject.uniforms[ uniformDesc.name ] = webgl.glslBindUniform( gl, shaderProgram, uniformDesc.variable );
			}

			return programObject;
		},


		loadStringFromUrl: function(url, callback) {
			var async = (callback != null && callback != undefined);

			var xmlhttp = window.XMLHttpRequest ?
						  new XMLHttpRequest() : /* Modern browsers */
						  new ActiveXObject("Microsoft.XMLHTTP");


			var result = null;
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
	}
}();

