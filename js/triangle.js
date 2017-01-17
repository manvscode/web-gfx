const $___46__46__47_src_47_lib_47_gfx_46_js__ = (function() {
  "use strict";
  var Lib3dMath = {
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
  class Color {
    constructor(r, g, b, a) {
      this.r = r || 0;
      this.g = g || 0;
      this.b = b || 0;
      this.a = a || 0;
    }
    static red() {
      return new Color(1, 0, 0, 1);
    }
    static green() {
      return new Color(0, 1, 0, 1);
    }
    static blue() {
      return new Color(0, 0, 1, 1);
    }
    static white() {
      return new Color(1, 1, 1, 1);
    }
    static black() {
      return new Color(0, 0, 0, 1);
    }
  }
  const Attribute = {
    vertex: "vertex",
    normal: "normal",
    textureCoord: "textureCoord",
    color: "color"
  };
  const Uniform = {
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
  class Shader {
    constructor(gfx, program, attributes, uniforms) {
      this.gfx = gfx;
      this.program = program;
      this.attributes = {};
      this.uniforms = {};
      for (let key in attributes) {
        let attributeDesc = attributes[key];
        this.attributes[attributeDesc.name] = gfx.glslBindAttribute(program, attributeDesc.variable);
        console.log("[GFX] Binded attribue " + attributeDesc.name + " (variable '" + attributeDesc.variable + "') with location " + this.attributes[attributeDesc.name]);
      }
      for (let key in uniforms) {
        let uniformDesc = uniforms[key];
        this.uniforms[uniformDesc.name] = gfx.glslBindUniform(program, uniformDesc.variable);
        console.log("[GFX] Binded uniform " + uniformDesc.name + " (variable '" + uniformDesc.variable + "')");
      }
    }
    use() {
      let gl = this.gfx.getContext();
      gl.useProgram(this.program);
    }
    attributes() {
      return this.attributes;
    }
    uniforms() {
      return this.uniforms;
    }
    prepare(uniformValues = [], debug = false) {
      let gl = this.gfx.getContext();
      for (let key in this.attributes) {
        gl.enableVertexAttribArray(this.attributes[key]);
        this.gfx.assertNoError();
      }
      for (let key in uniformValues) {
        let uniformValueDesc = uniformValues[key];
        let name = uniformValueDesc.name;
        let val = uniformValueDesc.value;
        let uniformLoc = this.uniforms[name];
        if (!uniformLoc) {
          throw "[GFX] Bad uniform location!";
        }
        if (typeof(val) == "number") {
          if (Number.isInteger(val)) {
            if (debug)
              console.log("[GFX] Setting integer uniform " + name + " with value: " + val);
            gl.uniform1i(uniformLoc, val);
          } else {
            if (debug)
              console.log("[GFX] Setting float uniform " + name + " with value: " + val);
            gl.uniform1f(uniformLoc, val);
          }
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
          let tr = uniformValueDesc.transpose;
          if (tr) {
            val.transpose();
          }
          if (debug)
            console.log("[GFX] Setting matrix3 uniform " + name + " with" + (tr ? " transposed" : "") + " value:\n" + val);
          gl.uniformMatrix3fv(uniformLoc, false, new Float32Array(val.m));
          this.gfx.assertNoError();
        } else if (val instanceof Lib3dMath.Matrix4) {
          let tr = uniformValueDesc.transpose;
          if (tr) {
            val.transpose();
          }
          if (debug)
            console.log("[GFX] Setting matrix4 uniform " + name + " with" + (tr ? " transposed" : "") + " value:\n" + val);
          gl.uniformMatrix4fv(uniformLoc, false, new Float32Array(val.m));
          this.gfx.assertNoError();
        } else {
          throw "[GFX] Bad uniform value!";
        }
      }
    }
  }
  class GFX {
    constructor(canvas, attributes) {
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
      let timer = () => {
        let t = null;
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
    static isSupported() {
      let canvas = document.createElement('canvas');
      try {
        let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      } catch (e) {
        return false;
      }
      return true;
    }
    requestAnimationFrame(func) {
      window.requestAnimationFrame(func);
    }
    initialize(setup_func) {
      let gfx_instance = this;
      this.gl.canvas.addEventListener("webglcontextlost", (event) => {
        console.log("[GFX] Context lost.");
        event.preventDefault();
      }, false);
      this.gl.canvas.addEventListener("webglcontextrestored", (event) => {
        console.log("[GFX] Context restored.");
        setup_func(gfx_instance);
      }, false);
      setup_func(this);
    }
    render(render_func) {
      render_func(this);
      window.requestAnimationFrame(this.render.bind(this, render_func));
    }
    run(initialization, render) {
      this.initialize(initialization);
      this.render(render);
    }
    assertNoError() {
      let err = this.gl.getError();
      let errorStrings = {};
      errorStrings[this.gl.NO_ERROR] = "No error";
      errorStrings[this.gl.OUT_OF_MEMORY] = "Out of memory";
      errorStrings[this.gl.INVALID_ENUM] = "Invalid enum";
      errorStrings[this.gl.INVALID_OPERATION] = "Invalid operation";
      errorStrings[this.gl.INVALID_FRAMEBUFFER_OPERATION] = "Invalid framebuffer operation";
      errorStrings[this.gl.INVALID_VALUE] = "Invalid value";
      errorStrings[this.gl.CONTEXT_LOST_WEBGL] = "Context lost WebGL";
      if (err != this.gl.NO_ERROR) {
        if (err != this.gl.CONTEXT_LOST_WEBGL || !this.initialization_fxn) {
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
      let vendor = this.gl.getParameter(this.gl.VENDOR);
      return vendor ? vendor : "unknown";
    }
    getRenderer() {
      let renderer = this.gl.getParameter(this.gl.RENDERER);
      return renderer ? renderer : "unknown";
    }
    getVersion() {
      let version = this.gl.getParameter(this.gl.VERSION);
      return version ? version : "unknown";
    }
    getShaderVersion(gl) {
      let glslVersion = this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION);
      return glslVersion ? glslVersion : "unknown";
    }
    printInfo() {
      console.log("[GFX] Vendor: " + this.getVendor());
      console.log("[GFX] Renderer: " + this.getRenderer());
      console.log("[GFX] Version: " + this.getVersion());
      console.log("[GFX] Shading Language: " + this.getShaderVersion());
    }
    frameDelta(now) {
      if (typeof this.frameDelta.last_render == 'undefined') {
        this.frameDelta.last_render = 0;
      }
      let delta = now - this.frameDelta.last_render;
      this.frameDelta.last_render = now;
      return delta;
    }
    frameRate(delta) {
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
    }
    printFrameRate(delta) {
      if (typeof this.printFrameRate.frame_rate_call_count == 'undefined') {
        this.printFrameRate.frame_rate_call_count = 0;
      }
      if (this.printFrameRate.frame_rate_call_count > 60) {
        this.printFrameRate.frame_rate_call_count = 0;
        console.log("[GFX] fps: " + this.frameRate(delta).toFixed(1));
      }
      this.printFrameRate.frame_rate_call_count += 1;
    }
    bufferCreate(buffer, target, usage) {
      GFX.validateArgs(this.bufferCreate.name, arguments);
      let bufferObject = this.gl.createBuffer();
      if (bufferObject) {
        this.gl.bindBuffer(target, bufferObject);
        this.gl.bufferData(target, buffer, usage);
        this.assertNoError();
      } else {
        console.error("[GFX] Unable to create buffer.");
        throw "Unable to create buffer.";
      }
      return bufferObject;
    }
    bufferDestroy(bufferObject) {
      GFX.validateArgs(this.bufferDestroy.name, arguments);
      if (this.gl.isBuffer(bufferObject)) {
        this.gl.deleteBuffer(bufferObject);
        this.assertNoError();
      }
    }
    floatBufferCreate(buffer, size, count, usage) {
      let result = this.bufferCreate(new Float32Array(buffer), this.gl.ARRAY_BUFFER, usage);
      result.size = size;
      result.count = count;
      return result;
    }
    indexBufferCreate(buffer, count, usage) {
      let result = this.bufferCreate(new Uint16Array(buffer), this.gl.ELEMENT_ARRAY_BUFFER, usage);
      result.count = count;
      return result;
    }
    glslCompileShader(type, source) {
      GFX.validateArgs(this.glslCompileShader.name, arguments);
      let shader = this.gl.createShader(type);
      if (!shader) {
        console.error("[GFX] Unable to create GLSL shader.");
        throw "Unable to create GLSL shader.";
      }
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      let compileStatus = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
      if (!compileStatus) {
        let log = this.gl.getShaderInfoLog(shader);
        if (log) {
          console.log("[GFX] " + log);
        }
        this.gl.deleteShader(shader);
        throw "GLSL Compilation Error";
      }
      return shader;
    }
    glslBindAttribute(program, name) {
      GFX.validateArgs(this.glslBindAttribute.name, arguments);
      let loc = this.gl.getAttribLocation(program, name);
      if (loc < 0 || loc == null || loc == undefined) {
        console.error("[GLSL] Unable to bind to attribute " + name + "'");
        throw "Unable to bind to attribute.";
      }
      return loc;
    }
    glslBindUniform(program, name) {
      GFX.validateArgs(this.glslBindUniform.name, arguments);
      let loc = this.gl.getUniformLocation(program, name);
      if (loc < 0 || loc == null || loc == undefined) {
        throw "[GFX] Unable to bind to uniform.";
      }
      return loc;
    }
    glslProgramFromShaders(shaders, markForDeletion) {
      GFX.validateArgs(this.glslProgramFromShaders.name, arguments);
      let shaderObjects = [];
      let isCompilationGood = true;
      for (let key in shaders) {
        let shaderInfo = shaders[key];
        let source = this.loadStringFromUrl(shaderInfo.url);
        try {
          let shader = this.glslCompileShader(shaderInfo.type, source);
          shaderObjects.push(shader);
        } catch (e) {
          isCompilationGood = false;
          break;
        }
        console.log("[GFX] Shader compiled: " + shaderInfo.url);
      }
      if (!isCompilationGood) {
        for (let key in shaderObjects) {
          let shader = shaderObjects[key];
          this.gl.deleteShader(shader);
        }
        throw "[GFX] GLSL Compilation Error";
      }
      let program = this.gl.createProgram();
      if (!program) {
        throw "[GFX] Unable to create GLSL program.";
      }
      for (let key in shaderObjects) {
        let shader = shaderObjects[key];
        this.gl.attachShader(program, shader);
      }
      this.gl.linkProgram(program);
      let linkingStatus = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
      if (linkingStatus) {
        console.log("[GFX] Shader linked.");
      } else {
        let log = this.gl.getProgramInfoLog(shader);
        if (log) {
          console.log("[GFX] " + log);
        }
        this.gl.deleteProgram(program);
        throw "[GFX] GLSL Linking Error";
      }
      if (markForDeletion) {
        console.log("[GFX] Shaders will be destroyed automatically.");
        for (let key in shaderObjects) {
          let shader = shaderObjects[key];
          this.gl.deleteShader(shader);
        }
      }
      return program;
    }
    glslProgramObject(shaderAssets, attributes, uniforms) {
      GFX.validateArgs(this.glslProgramObject.name, arguments);
      let shaderProgram = this.glslProgramFromShaders(shaderAssets, false);
      var gl = this.getContext();
      return new Shader(this, shaderProgram, attributes, uniforms);
    }
    loadStringFromUrl(url, callback) {
      let async = (callback != null && callback != undefined);
      let xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      let result = null;
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
    loadTexture2D(url, min_filter = null, mag_filter = null, wrap_s = null, wrap_t = null) {
      let gl = this.getContext();
      let generate_mipmaps = false;
      if (!min_filter) {
        min_filter = gl.NEAREST;
      }
      if (!mag_filter) {
        mag_filter = gl.LINEAR;
      }
      if (!wrap_s) {
        wrap_s = gl.CLAMP_TO_EDGE;
      }
      if (!wrap_t) {
        wrap_t = gl.CLAMP_TO_EDGE;
      }
      switch (min_filter) {
        case gl.NEAREST_MIPMAP_LINEAR:
        case gl.NEAREST_MIPMAP_NEAREST:
        case gl.LINEAR_MIPMAP_LINEAR:
        case gl.LINEAR_MIPMAP_NEAREST:
          generate_mipmaps = true;
          break;
        default:
          break;
      }
      switch (mag_filter) {
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
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_s);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_t);
        if (generate_mipmaps) {
          if (!GFX.isPowerOf2(image.width) || !GFX.isPowerOf2(image.height)) {
            throw "[GFX] Texture does not have power of two dimensions.";
          } else {
            console.log("[GFX] Generating mipmaps for texture: " + url);
            gl.generateMipmap(gl.TEXTURE_2D);
          }
        }
      });
      return texture;
    }
    resize(setviewport = false) {
      var gl = this.getContext();
      var displayWidth = gl.canvas.clientWidth;
      var displayHeight = gl.canvas.clientHeight;
      if (gl.canvas.width != displayWidth || gl.canvas.height != displayHeight) {
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayHeight;
      }
      if (setviewport) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }
    }
    static isPowerOf2(n) {
      return (n & (n - 1)) == 0;
    }
  }
  return {
    get Lib3dMath() {
      return Lib3dMath;
    },
    get Color() {
      return Color;
    },
    get Attribute() {
      return Attribute;
    },
    get Uniform() {
      return Uniform;
    },
    get Shader() {
      return Shader;
    },
    get GFX() {
      return GFX;
    }
  };
})();
"use strict";
const {GFX,
  Lib3dMath,
  Attribute,
  Uniform,
  Shader} = $___46__46__47_src_47_lib_47_gfx_46_js__;
if (!GFX.isSupported()) {
  throw "GFX is not supported!";
}
var canvas = document.getElementById('gfx');
var attributes = {
  alpha: true,
  depth: false,
  stencil: false,
  antialias: true,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false
};
console.info("Starting application...");
var gfx = new GFX(canvas, attributes);
let gl = gfx.getContext();
gfx.printInfo();
gfx.resize();
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.DEPTH_TEST);
gl.clearDepth(1.0);
gl.depthFunc(gl.LEQUAL);
gl.disable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);
gl.disable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gfx.assertNoError();
gl.clearColor(0.0, 0.0, 0.0, 1.0);
var angle = 0;
var delta = 0;
var triangleVertices = [0.0000000000000001, 1.0000000000000000 - 0.02, 0.0000000000000000, 1.0000000000000000, 0.0000000000000000, 0.0000000000000000, -0.8660254037844387, -0.4999999999999999, 0.0000000000000000, 0.0000000000000000, 1.0000000000000000, 0.0000000000000000, 0.8660254037844385, -0.5000000000000002, 0.0000000000000000, 0.0000000000000000, 0.0000000000000000, 1.0000000000000000];
var vboTriangle = gfx.floatBufferCreate(triangleVertices, 6, 3, gl.STATIC_DRAW);
var triangle_shader = gfx.glslProgramObject([{
  type: gl.VERTEX_SHADER,
  url: "assets/shaders/triangle-100.v-glsl"
}, {
  type: gl.FRAGMENT_SHADER,
  url: "assets/shaders/triangle-100.f-glsl"
}], [{
  name: Attribute.vertex,
  variable: "a_vertex"
}, {
  name: Attribute.color,
  variable: "a_color"
}], [{
  name: Uniform.modelView,
  variable: "u_model_view"
}]);
var spinning_triangle = () => {
  let now = gfx.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var aspect = gfx.getAspectRatio();
  var projectionMatrix = Lib3dMath.Projections.orthographic(-2 * aspect, 2 * aspect, -2, 2, -10, 10);
  var translation = Lib3dMath.Transforms.translate(new Lib3dMath.Vector3(0, 0, -2));
  var orientation = Lib3dMath.Transforms.rotateZ(angle);
  var transform = translation.multiply(orientation);
  var modelView = projectionMatrix.multiplyMatrix(transform);
  if (angle >= Lib3dMath.Core.TWO_PI) {
    angle = 0.0;
  } else {
    angle += 0.001 * delta;
  }
  triangle_shader.use();
  triangle_shader.prepare([{
    name: Uniform.modelView,
    value: modelView
  }], false);
  gl.bindBuffer(gl.ARRAY_BUFFER, vboTriangle);
  this.gfx.assertNoError();
  gl.vertexAttribPointer(triangle_shader.attributes.vertex, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
  this.gfx.assertNoError();
  gl.vertexAttribPointer(triangle_shader.attributes.color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3);
  this.gfx.assertNoError();
  gl.drawArrays(gl.TRIANGLES, 0, vboTriangle.count);
  this.gfx.assertNoError();
  gl.flush();
  gfx.requestAnimationFrame(spinning_triangle);
  delta = gfx.frameDelta(now);
  gfx.printFrameRate(delta);
};
spinning_triangle();
//# sourceMappingURL=triangle.js.map
