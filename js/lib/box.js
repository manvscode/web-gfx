System.register([], function($__export) {
  "use strict";
  var Box;
  return {
    setters: [],
    execute: function() {
      Box = function() {
        function Box(gfx, width, height, length) {
          this.gfx = gfx || null;
          this.width = width || 0;
          this.height = height || 0;
          this.length = length || 0;
          this.vboVertices = 0;
          this.vboNormals = 0;
          this.vboIndices = 0;
          this.vboTextureCoordinates = 0;
        }
        return ($traceurRuntime.createClass)(Box, {
          create: function() {
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
          },
          destroy: function() {
            this.gfx.bufferDestroy(vboVertices);
            this.gfx.bufferDestroy(vboNormals);
            this.gfx.bufferDestroy(vboTextureCoordinates);
            this.gfx.bufferDestroy(vboIndices);
            this.gfx.assertNoError();
          },
          render: function(shader) {
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
        }, {});
      }();
      $__export("Box", Box);
    }
  };
});
//# sourceMappingURL=box.js.map
