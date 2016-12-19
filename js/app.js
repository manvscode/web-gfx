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
    texture: "texture"
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
        throw "[GFX] Error (" + errorStrings[err] + ")";
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
    requestAnimationFrame(func) {
      window.requestAnimationFrame(func);
    }
    render(draw_func) {
      draw_func.bind(this);
      console.info(draw_func);
      draw_func();
      window.requestAnimationFrame(this.render, this.gl.canvas);
    }
    bufferCreate(buffer, target, usage) {
      GFX.validateArgs(this.bufferCreate.name, arguments);
      let bufferObject = gl.createBuffer();
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
        for (let shader in shaderObjects) {
          this.gl.deleteShader(shader);
        }
        throw "[GFX] GLSL Compilation Error";
      }
      let linkingStatus = true;
      let program = this.gl.createProgram();
      if (!program) {
        throw "[GFX] Unable to create GLSL program.";
      }
      for (let key in shaderObjects) {
        let shader = shaderObjects[key];
        this.gl.attachShader(program, shader);
      }
      this.gl.linkProgram(program);
      linkingStatus = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
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
const $___46__46__47_src_47_lib_47_box_46_js__ = (function() {
  "use strict";
  class Box {
    constructor(gfx, width, height, length) {
      this.gfx = gfx || null;
      this.width = width || 0;
      this.height = height || 0;
      this.length = length || 0;
      this.vboVertices = 0;
      this.vboNormals = 0;
      this.vboIndices = 0;
      this.vboTextureCoordinates = 0;
    }
    create() {
      var halfWidth = this.width * 0.5;
      var halfHeight = this.height * 0.5;
      var halfLength = this.length * 0.5;
      var vertices = [-halfWidth, -halfHeight, halfLength, halfWidth, -halfHeight, halfLength, halfWidth, halfHeight, halfLength, -halfWidth, halfHeight, halfLength, -halfWidth, halfHeight, halfLength, halfWidth, halfHeight, halfLength, halfWidth, halfHeight, -halfLength, -halfWidth, halfHeight, -halfLength, halfWidth, -halfHeight, -halfLength, -halfWidth, -halfHeight, -halfLength, -halfWidth, halfHeight, -halfLength, halfWidth, halfHeight, -halfLength, -halfWidth, -halfHeight, -halfLength, halfWidth, -halfHeight, -halfLength, halfWidth, -halfHeight, halfLength, -halfWidth, -halfHeight, halfLength, -halfWidth, -halfHeight, -halfLength, -halfWidth, -halfHeight, halfLength, -halfWidth, halfHeight, halfLength, -halfWidth, halfHeight, -halfLength, halfWidth, -halfHeight, halfLength, halfWidth, -halfHeight, -halfLength, halfWidth, halfHeight, -halfLength, halfWidth, halfHeight, halfLength];
      var normals = [-0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, -0.0, -0.0, 1.0, -0.0, 0.0, -0.0, -1.0, -0.0, -0.0, -1.0, -0.0, 0.0, -1.0, 0.0, 0.0, -1.0, -0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -1.0, 0.0, -0.0, -1.0, 0.0, -1.0, -0.0, -0.0, -1.0, -0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -0.0, 1.0, -0.0, 0.0, 1.0, -0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, 0.0];
      var textureCoordinates = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
      var indices = [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15, 12, 16, 17, 18, 18, 19, 16, 20, 21, 22, 22, 23, 20];
      var gl = this.gfx.getContext();
      this.vboVertices = this.gfx.bufferCreate(new Float32Array(vertices), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
      this.vboVertices.itemSize = 3;
      this.vboVertices.itemCount = vertices.length / 3;
      this.vboNormals = this.gfx.bufferCreate(new Float32Array(normals), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
      this.vboNormals.itemSize = 3;
      this.vboNormals.itemCount = normals.length / 3;
      this.vboTextureCoordinates = this.gfx.bufferCreate(new Float32Array(textureCoordinates), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
      this.vboTextureCoordinates.itemSize = 2;
      this.vboTextureCoordinates.itemCount = textureCoordinates.length / 2;
      this.vboIndices = this.gfx.bufferCreate(new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
      this.vboIndices.itemSize = 1;
      this.vboIndices.itemCount = indices.length;
      this.gfx.assertNoError();
    }
    destroy() {
      this.gfx.bufferDestroy(vboVertices);
      this.gfx.bufferDestroy(vboNormals);
      this.gfx.bufferDestroy(vboTextureCoordinates);
      this.gfx.bufferDestroy(vboIndices);
      this.gfx.assertNoError();
    }
    render(shader) {
      var gl = this.gfx.getContext();
      gl.enableVertexAttribArray(shader.attributes.vertex);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vboVertices);
      gl.vertexAttribPointer(shader.attributes.vertex, 3, gl.FLOAT, false, 0, 0);
      this.gfx.assertNoError();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboIndices);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
      this.gfx.assertNoError();
      gl.disableVertexAttribArray(shader.attributes.vertex);
      gl.disableVertexAttribArray(shader.attributes.normal);
      gl.disableVertexAttribArray(shader.attributes.textureCoord);
      this.gfx.assertNoError();
    }
  }
  return {get Box() {
      return Box;
    }};
})();
"use strict";
const {GFX,
  Lib3dMath,
  Attribute,
  Uniform,
  Shader} = $___46__46__47_src_47_lib_47_gfx_46_js__;
const {Box} = $___46__46__47_src_47_lib_47_box_46_js__;
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
var shaders = {};
var initializeObjectShader = () => {
  var shaderAssets = [{
    type: gl.VERTEX_SHADER,
    url: "assets/shaders/object-100.v.glsl"
  }, {
    type: gl.FRAGMENT_SHADER,
    url: "assets/shaders/object-100.f.glsl"
  }];
  let attributes = [{
    name: Attribute.vertex,
    variable: "a_vertex"
  }, {
    name: Attribute.normal,
    variable: "a_normal"
  }, {
    name: Attribute.textureCoord,
    variable: "a_tex_coord"
  }];
  let uniforms = [{
    name: Uniform.projectionMatrix,
    variable: "u_projection"
  }, {
    name: Uniform.modelView,
    variable: "u_model_view"
  }];
  shaders["objectShader"] = gfx.glslProgramObject(shaderAssets, attributes, uniforms);
};
var b = new Box(gfx, 1.0, 1.0, 1.0);
b.create();
var objects = [];
objects.push(b);
gl.viewport(0, 0, gl.canvas.offsetWidth, gl.canvas.offsetHeight);
gl.enable(gl.DEPTH_TEST);
gl.clearDepth(1.0);
gl.depthFunc(gl.LEQUAL);
gl.disable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);
gl.disable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gfx.assertNoError();
gl.clearColor(0.2, 0.2, 0.2, 1.0);
var angle = 0;
var delta = 0;
var triangleVertices = [1.0000000000000000, 0.0000000000000000, 0.0000000000000000, 1.0000000000000000, 0.0000000000000000, 0.0000000000000000, -0.4999999999999999, 0.8660254037844387, 0.0000000000000000, 0.0000000000000000, 1.0000000000000000, 0.0000000000000000, -0.5000000000000001, -0.8660254037844386, 0.0000000000000000, 0.0000000000000000, 0.0000000000000000, 1.0000000000000000];
var vboTriangle = gfx.floatBufferCreate(triangleVertices, 6, 3, gl.STATIC_DRAW);
var triangle_shader = gfx.glslProgramObject([{
  type: gl.VERTEX_SHADER,
  url: "assets/shaders/spinning-triangle-100.v-glsl"
}, {
  type: gl.FRAGMENT_SHADER,
  url: "assets/shaders/spinning-triangle-100.f-glsl"
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
  var projectionMatrix = Lib3dMath.Projections.orthographic(-2 * gfx.getAspectRatio(), 2 * gfx.getAspectRatio(), -2, 2, -10, 10);
  var transform = Lib3dMath.Transforms.translate(new Lib3dMath.Vector3(0, 0, -2)).multiplyMatrix(Lib3dMath.Transforms.rotateZ(angle));
  var modelView = projectionMatrix.multiplyMatrix(transform);
  if (angle >= Lib3dMath.Core.TWO_PI) {
    angle = 0.0;
  } else {
    angle += 0.001 * delta;
  }
  triangle_shader.use();
  triangle_shader.prepare([{
    name: Uniform.modelView,
    transpose: false,
    value: modelView
  }], false);
  gl.bindBuffer(gl.ARRAY_BUFFER, vboTriangle);
  this.gfx.assertNoError();
  gl.vertexAttribPointer(triangle_shader.attributes.vertex, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
  this.gfx.assertNoError();
  gl.vertexAttribPointer(triangle_shader.attributes.color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3);
  this.gfx.assertNoError();
  gl.drawArrays(gl.POINTS, 0, vboTriangle.count);
  this.gfx.assertNoError();
  gl.flush();
  gfx.requestAnimationFrame(spinning_triangle);
  delta = gfx.frameDelta(now);
};
spinning_triangle();
//# sourceMappingURL=app.js.map
