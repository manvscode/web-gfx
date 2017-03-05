import { Renderable } from './renderable.js';

export class Background extends Renderable {
	constructor( gfx ) {
		super( gfx );
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
	}

	render(shader) {
        let gl = this.gfx.getContext();
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

	update(delta) {
	}
}
