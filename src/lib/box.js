
export class Box {
	constructor( gfx, width, height, length ) {
		this.gfx    = gfx || null;
		this.width  = width || 0;
		this.height = height || 0;
		this.length = length || 0;

		this.vboVertices           = 0;
		this.vboNormals            = 0;
		this.vboIndices            = 0;
		this.vboTextureCoordinates = 0;
	}

	create() {
		var halfWidth  = this.width * 0.5;
		var halfHeight = this.height * 0.5;
		var halfLength = this.length * 0.5;

		var vertices = [
			 // front
			-halfWidth, -halfHeight,  halfLength,
			 halfWidth, -halfHeight,  halfLength,
			 halfWidth,  halfHeight,  halfLength,
			-halfWidth,  halfHeight,  halfLength,
			 // top
			-halfWidth,  halfHeight,  halfLength,
			 halfWidth,  halfHeight,  halfLength,
			 halfWidth,  halfHeight, -halfLength,
			-halfWidth,  halfHeight, -halfLength,
			 // back
			 halfWidth, -halfHeight, -halfLength,
			-halfWidth, -halfHeight, -halfLength,
			-halfWidth,  halfHeight, -halfLength,
			 halfWidth,  halfHeight, -halfLength,
			 // bottom
			-halfWidth, -halfHeight, -halfLength,
			 halfWidth, -halfHeight, -halfLength,
			 halfWidth, -halfHeight,  halfLength,
			-halfWidth, -halfHeight,  halfLength,
			 // left
			-halfWidth, -halfHeight, -halfLength,
			-halfWidth, -halfHeight,  halfLength,
			-halfWidth,  halfHeight,  halfLength,
			-halfWidth,  halfHeight, -halfLength,
			 // right
			 halfWidth, -halfHeight,  halfLength,
			 halfWidth, -halfHeight, -halfLength,
			 halfWidth,  halfHeight, -halfLength,
			 halfWidth,  halfHeight,  halfLength,
		];

		var normals = [
			 // front
			-0.0, -0.0,  1.0,
			 0.0, -0.0,  1.0,
			 0.0,  0.0,  1.0,
			-0.0,  0.0,  1.0,
			 // top
			-0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0, -0.0,
			-0.0,  1.0, -0.0,
			 // back
			 0.0, -0.0, -1.0,
			-0.0, -0.0, -1.0,
			-0.0,  0.0, -1.0,
			 0.0,  0.0, -1.0,
			 // bottom
			-0.0, -1.0, -0.0,
			 0.0, -1.0, -0.0,
			 0.0, -1.0,  0.0,
			-0.0, -1.0,  0.0,
			 // left
			-1.0, -0.0, -0.0,
			-1.0, -0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0, -0.0,
			 // right
			 1.0, -0.0,  0.0,
			 1.0, -0.0, -0.0,
			 1.0,  0.0, -0.0,
			 1.0,  0.0,  0.0,
		];

		var textureCoordinates = [
			// front
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			// top
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			// back
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			// bottom
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			// left
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			// right
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0
		];

		var indices = [
			// front
			0,  1,  2,
			2,  3,  0,
			// top
			4,  5,  6,
			6,  7,  4,
			// back
			8,  9, 10,
			10, 11,  8,
			// bottom
			12, 13, 14,
			14, 15, 12,
			// left
			16, 17, 18,
			18, 19, 16,
			// right
			20, 21, 22,
			22, 23, 20,
		];

		var gl = this.gfx.getContext();

		this.vboVertices           = this.gfx.bufferCreate( new Float32Array(vertices), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
		this.vboVertices.itemSize  = 3;
		this.vboVertices.itemCount = vertices.length / 3;

		this.vboNormals           = this.gfx.bufferCreate( new Float32Array(normals), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
		this.vboNormals.itemSize  = 3;
		this.vboNormals.itemCount = normals.length / 3;

		this.vboTextureCoordinates           = this.gfx.bufferCreate( new Float32Array(textureCoordinates), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
		this.vboTextureCoordinates.itemSize  = 2;
		this.vboTextureCoordinates.itemCount = textureCoordinates.length / 2;

		this.vboIndices           = this.gfx.bufferCreate( new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW );
		this.vboIndices.itemSize  = 1;
		this.vboIndices.itemCount = indices.length;

		this.gfx.assertNoError( );
	}

	destroy() {
		this.gfx.bufferDestroy( vboVertices );
		this.gfx.bufferDestroy( vboNormals );
		this.gfx.bufferDestroy( vboTextureCoordinates );
		this.gfx.bufferDestroy( vboIndices );
		this.gfx.assertNoError( );
	}

	render( shader ) {
		var gl = this.gfx.getContext();


		gl.enableVertexAttribArray( shader.attributes.vertex );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vboVertices );
		gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, 0, 0 );
		this.gfx.assertNoError( );

		/*
		gl.enableVertexAttribArray( shader.attributes.normal );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vboNormals );
		gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, 0, 0 );
		this.gfx.assertNoError( );

		gl.enableVertexAttribArray( shader.attributes.textureCoord );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vboTextureCoordinates );
		gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, 0, 0 );
		this.gfx.assertNoError( );
		*/

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.vboIndices );
		gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );
		this.gfx.assertNoError( );

		gl.disableVertexAttribArray( shader.attributes.vertex );
		gl.disableVertexAttribArray( shader.attributes.normal );
		gl.disableVertexAttribArray( shader.attributes.textureCoord );

		this.gfx.assertNoError( );
	}
}
