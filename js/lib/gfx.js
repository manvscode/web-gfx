System.register([], function($__export) {
  "use strict";
  var Lib3dMath,
      Color,
      Attribute,
      Uniform,
      Shader,
      GFX;
  return {
    setters: [],
    execute: function() {
      Lib3dMath = {
        Core: lib3dmath,
        Transforms: lib3dmath.transforms,
        Projections: lib3dmath.transforms.projections,
        Vector2: lib3dmath.Vec2,
        Vector3: lib3dmath.Vec3,
        Vector4: lib3dmath.Vec4,
        Matrix2: lib3dmath.Mat2,
        Matrix3: lib3dmath.Mat3,
        Matrix4: lib3dmath.Mat4,
        Quaternion: lib3dmath.Quat
      };
      $__export("Lib3dMath", Lib3dMath);
      Color = function() {
        function Color(r, g, b, a) {
          this.r = r || 0;
          this.g = g || 0;
          this.b = b || 0;
          this.a = a || 0;
        }
        return ($traceurRuntime.createClass)(Color, {}, {
          red: function() {
            return new Color(1, 0, 0, 1);
          },
          green: function() {
            return new Color(0, 1, 0, 1);
          },
          blue: function() {
            return new Color(0, 0, 1, 1);
          },
          white: function() {
            return new Color(1, 1, 1, 1);
          },
          black: function() {
            return new Color(0, 0, 0, 1);
          }
        });
      }();
      $__export("Color", Color);
      Attribute = {
        vertex: "vertex",
        normal: "normal",
        textureCoord: "textureCoord",
        color: "color"
      };
      $__export("Attribute", Attribute);
      Uniform = {
        projectionMatrix: "projectionMatrix",
        modelView: "modelView",
        normalMatrix: "normalMatrix",
        texture: "texture"
      };
      $__export("Uniform", Uniform);
      Shader = function() {
        function Shader(gfx, program, attributes, uniforms) {
          this.gfx = gfx;
          this.program = program;
          this.attributes = {};
          this.uniforms = {};
          for (var key in attributes) {
            var attributeDesc = attributes[key];
            this.attributes[attributeDesc.name] = gfx.glslBindAttribute(program, attributeDesc.variable);
            console.log("[GFX] Binded attribue " + attributeDesc.name + " (variable '" + attributeDesc.variable + "') with location " + this.attributes[attributeDesc.name]);
          }
          for (var key$__3 in uniforms) {
            var uniformDesc = uniforms[key$__3];
            this.uniforms[uniformDesc.name] = gfx.glslBindUniform(program, uniformDesc.variable);
            console.log("[GFX] Binded uniform " + uniformDesc.name + " (variable '" + uniformDesc.variable + "')");
          }
        }
        return ($traceurRuntime.createClass)(Shader, {
          use: function() {
            var gl = this.gfx.getContext();
            gl.useProgram(this.program);
          },
          attributes: function() {
            return this.attributes;
          },
          uniforms: function() {
            return this.uniforms;
          },
          prepare: function() {
            var uniformValues = arguments[0] !== (void 0) ? arguments[0] : [];
            var debug = arguments[1] !== (void 0) ? arguments[1] : false;
            var gl = this.gfx.getContext();
            for (var key in this.attributes) {
              gl.enableVertexAttribArray(this.attributes[key]);
              this.gfx.assertNoError();
            }
            for (var key$__4 in uniformValues) {
              var uniformValueDesc = uniformValues[key$__4];
              var name = uniformValueDesc.name;
              var val = uniformValueDesc.value;
              var uniformLoc = this.uniforms[name];
              if (!uniformLoc) {
                throw "[GFX] Bad uniform location!";
              }
              if (val instanceof Number) {
                if (debug)
                  console.log("[GFX] Setting float uniform " + name + " with value: " + val);
                gl.uniform1f(uniformLoc, val);
                this.gfx.assertNoError();
              } else if (val instanceof Lib3dMath.Vector3) {
                if (debug)
                  console.log("[GFX] Setting vector3 uniform " + name + " with value: " + val);
                gl.uniform3fv(uniformLoc, new Float32Array([val.x, val.y, val.z]));
                this.gfx.assertNoError();
              } else if (val instanceof Lib3dMath.Vector4) {
                if (debug)
                  console.log("[GFX] Setting vector4 uniform " + name + " with value: " + val);
                gl.uniform4fv(uniformLoc, new Float32Array([val.x, val.y, val.z, val.w]));
                this.gfx.assertNoError();
              } else if (val instanceof Lib3dMath.Matrix3) {
                var tr = uniformValueDesc.transpose;
                if (tr) {
                  val.transpose();
                }
                if (debug)
                  console.log("[GFX] Setting matrix3 uniform " + name + " with" + (tr ? " transposed" : "") + " value:\n" + val);
                gl.uniformMatrix3fv(uniformLoc, false, new Float32Array(val.m));
                this.gfx.assertNoError();
              } else if (val instanceof Lib3dMath.Matrix4) {
                var tr$__5 = uniformValueDesc.transpose;
                if (tr$__5) {
                  val.transpose();
                }
                if (debug)
                  console.log("[GFX] Setting matrix4 uniform " + name + " with" + (tr$__5 ? " transposed" : "") + " value:\n" + val);
                gl.uniformMatrix4fv(uniformLoc, false, new Float32Array(val.m));
                this.gfx.assertNoError();
              } else {
                throw "[GFX] Bad uniform value!";
              }
            }
          }
        }, {});
      }();
      $__export("Shader", Shader);
      GFX = function() {
        function GFX(canvas, attributes) {
          if (!attributes) {
            attributes = {
              alpha: true,
              depth: true,
              stencil: true,
              antialias: false,
              premultipliedAlpha: false,
              preserveDrawingBuffer: false
            };
          }
          var timer = function() {
            var t = null;
            if (window.performance.now) {
              t = function() {
                return window.performance.now();
              };
            } else {
              if (window.performance.webkitNow) {
                t = function() {
                  return window.performance.webkitNow();
                };
              } else {
                t = function() {
                  return new Date().getTime();
                };
              }
            }
            return t;
          };
          this.gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
          if (!this.gl) {
            throw "Bad WebGL context.";
          }
          this.now = timer();
          this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        }
        return ($traceurRuntime.createClass)(GFX, {
          assertNoError: function() {
            var err = this.gl.getError();
            var errorStrings = {};
            errorStrings[this.gl.NO_ERROR] = "No error";
            errorStrings[this.gl.OUT_OF_MEMORY] = "Out of memory";
            errorStrings[this.gl.INVALID_ENUM] = "Invalid enum";
            errorStrings[this.gl.INVALID_OPERATION] = "Invalid operation";
            errorStrings[this.gl.INVALID_FRAMEBUFFER_OPERATION] = "Invalid framebuffer operation";
            errorStrings[this.gl.INVALID_VALUE] = "Invalid value";
            errorStrings[this.gl.CONTEXT_LOST_WEBGL] = "Context lost WebGL";
            if (err != this.gl.NO_ERROR) {
              throw "[GFX] Error (" + errorStrings[err] + ")";
            }
          },
          getContext: function() {
            return this.gl;
          },
          getCanvas: function() {
            return this.gl.canvas;
          },
          getWidth: function() {
            return this.gl.canvas.offsetWidth;
          },
          getHeight: function() {
            return this.gl.canvas.offsetHeight;
          },
          getAspectRatio: function() {
            return this.getWidth() / this.getHeight();
          },
          getVendor: function() {
            var vendor = this.gl.getParameter(this.gl.VENDOR);
            return vendor ? vendor : "unknown";
          },
          getRenderer: function() {
            var renderer = this.gl.getParameter(this.gl.RENDERER);
            return renderer ? renderer : "unknown";
          },
          getVersion: function() {
            var version = this.gl.getParameter(this.gl.VERSION);
            return version ? version : "unknown";
          },
          getShaderVersion: function(gl) {
            var glslVersion = this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION);
            return glslVersion ? glslVersion : "unknown";
          },
          printInfo: function() {
            console.log("[GFX] Vendor: " + this.getVendor());
            console.log("[GFX] Renderer: " + this.getRenderer());
            console.log("[GFX] Version: " + this.getVersion());
            console.log("[GFX] Shading Language: " + this.getShaderVersion());
          },
          frameDelta: function(now) {
            if (typeof this.frameDelta.last_render == 'undefined') {
              this.frameDelta.last_render = 0;
            }
            var delta = now - this.frameDelta.last_render;
            this.frameDelta.last_render = now;
            return delta;
          },
          frameRate: function(delta) {
            if (typeof this.frameRate.last_time1 == 'undefined') {
              this.frameRate.last_time1 = 0;
            }
            if (typeof this.frameRate.last_time2 == 'undefined') {
              this.frameRate.last_time2 = 0;
            }
            delta = (0.6 * delta + 0.3 * this.frameRate.last_time1 + 0.1 * this.frameRate.last_time2);
            this.frameRate.last_time2 = this.frameRate.last_time1;
            this.frameRate.last_time1 = delta;
            return 1000.0 / delta;
          },
          printFrameRate: function(delta) {
            if (typeof this.printFrameRate.frame_rate_call_count == 'undefined') {
              this.printFrameRate.frame_rate_call_count = 0;
            }
            if (this.printFrameRate.frame_rate_call_count > 60) {
              this.printFrameRate.frame_rate_call_count = 0;
              console.log("[GFX] fps: " + this.frameRate(delta).toFixed(1));
            }
            this.printFrameRate.frame_rate_call_count += 1;
          },
          requestAnimationFrame: function(func) {
            window.requestAnimationFrame(func);
          },
          render: function(draw_func) {
            draw_func.bind(this);
            console.info(draw_func);
            draw_func();
            window.requestAnimationFrame(this.render, this.gl.canvas);
          },
          bufferCreate: function(buffer, target, usage) {
            GFX.validateArgs(this.bufferCreate.name, arguments);
            var bufferObject = gl.createBuffer();
            if (bufferObject) {
              this.gl.bindBuffer(target, bufferObject);
              this.gl.bufferData(target, buffer, usage);
              this.assertNoError();
            } else {
              console.error("[GFX] Unable to create buffer.");
              throw "Unable to create buffer.";
            }
            return bufferObject;
          },
          bufferDestroy: function(bufferObject) {
            GFX.validateArgs(this.bufferDestroy.name, arguments);
            if (this.gl.isBuffer(bufferObject)) {
              this.gl.deleteBuffer(bufferObject);
              this.assertNoError();
            }
          },
          floatBufferCreate: function(buffer, size, count, usage) {
            var result = this.bufferCreate(new Float32Array(buffer), this.gl.ARRAY_BUFFER, usage);
            result.size = size;
            result.count = count;
            return result;
          },
          indexBufferCreate: function(buffer, count, usage) {
            var result = this.bufferCreate(new Uint16Array(buffer), this.gl.ELEMENT_ARRAY_BUFFER, usage);
            result.count = count;
            return result;
          },
          glslCompileShader: function(type, source) {
            GFX.validateArgs(this.glslCompileShader.name, arguments);
            var shader = this.gl.createShader(type);
            if (!shader) {
              console.error("[GFX] Unable to create GLSL shader.");
              throw "Unable to create GLSL shader.";
            }
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            var compileStatus = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
            if (!compileStatus) {
              var log = this.gl.getShaderInfoLog(shader);
              if (log) {
                console.log("[GFX] " + log);
              }
              this.gl.deleteShader(shader);
              throw "GLSL Compilation Error";
            }
            return shader;
          },
          glslBindAttribute: function(program, name) {
            GFX.validateArgs(this.glslBindAttribute.name, arguments);
            var loc = this.gl.getAttribLocation(program, name);
            if (loc < 0 || loc == null || loc == undefined) {
              console.error("[GLSL] Unable to bind to attribute " + name + "'");
              throw "Unable to bind to attribute.";
            }
            return loc;
          },
          glslBindUniform: function(program, name) {
            GFX.validateArgs(this.glslBindUniform.name, arguments);
            var loc = this.gl.getUniformLocation(program, name);
            if (loc < 0 || loc == null || loc == undefined) {
              throw "[GFX] Unable to bind to uniform.";
            }
            return loc;
          },
          glslProgramFromShaders: function(shaders, markForDeletion) {
            GFX.validateArgs(this.glslProgramFromShaders.name, arguments);
            var shaderObjects = [];
            var isCompilationGood = true;
            for (var key in shaders) {
              var shaderInfo = shaders[key];
              var source = this.loadStringFromUrl(shaderInfo.url);
              try {
                var shader = this.glslCompileShader(shaderInfo.type, source);
                shaderObjects.push(shader);
              } catch (e) {
                isCompilationGood = false;
                break;
              }
              console.log("[GFX] Shader compiled: " + shaderInfo.url);
            }
            if (!isCompilationGood) {
              for (var shader$__6 in shaderObjects) {
                this.gl.deleteShader(shader$__6);
              }
              throw "[GFX] GLSL Compilation Error";
            }
            var linkingStatus = true;
            var program = this.gl.createProgram();
            if (!program) {
              throw "[GFX] Unable to create GLSL program.";
            }
            for (var key$__7 in shaderObjects) {
              var shader$__8 = shaderObjects[key$__7];
              this.gl.attachShader(program, shader$__8);
            }
            this.gl.linkProgram(program);
            linkingStatus = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
            if (linkingStatus) {
              console.log("[GFX] Shader linked.");
            } else {
              var log = this.gl.getProgramInfoLog(shader);
              if (log) {
                console.log("[GFX] " + log);
              }
              this.gl.deleteProgram(program);
              throw "[GFX] GLSL Linking Error";
            }
            if (markForDeletion) {
              console.log("[GFX] Shaders will be destroyed automatically.");
              for (var key$__9 in shaderObjects) {
                var shader$__10 = shaderObjects[key$__9];
                this.gl.deleteShader(shader$__10);
              }
            }
            return program;
          },
          glslProgramObject: function(shaderAssets, attributes, uniforms) {
            GFX.validateArgs(this.glslProgramObject.name, arguments);
            var shaderProgram = this.glslProgramFromShaders(shaderAssets, false);
            var gl = this.getContext();
            return new Shader(this, shaderProgram, attributes, uniforms);
          },
          loadStringFromUrl: function(url, callback) {
            var async = (callback != null && callback != undefined);
            var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            var result = null;
            xmlhttp.onreadystatechange = function() {
              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (async) {
                  result = callback(xmlhttp.responseText);
                } else {
                  result = xmlhttp.responseText;
                }
              }
            };
            xmlhttp.open("GET", url, async);
            xmlhttp.send();
            return result;
          }
        }, {
          isSupported: function() {
            var canvas = document.createElement('canvas');
            try {
              var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            } catch (e) {
              return false;
            }
            return true;
          },
          validateArgs: function(functionName, args) {
            for (var ii = 0; ii < args.length; ++ii) {
              if (args[ii] === undefined) {
                console.error("[GFX] Argument is undefined in " + functionName + ".");
              }
            }
          }
        });
      }();
      $__export("GFX", GFX);
    }
  };
});
//# sourceMappingURL=gfx.js.map
