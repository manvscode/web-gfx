import { Renderable } from './renderable.js';
import { UnderwaterBaseModel } from '../assets/models/underwater-base.js';

export class UnderwaterBase extends Renderable {
	constructor( gfx ) {
		super(gfx);
        let gl = gfx.getContext();

        this.vboHull           = gfx.bufferCreate( new Float32Array(UnderwaterBaseModel.underwaterbase), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboHull.itemSize  = 8;
        this.vboHull.itemCount = UnderwaterBaseModel.underwaterbase.length / 8;

        this.vboGlass           = gfx.bufferCreate( new Float32Array(UnderwaterBaseModel.glass), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboGlass.itemSize  = 8;
        this.vboGlass.itemCount = UnderwaterBaseModel.glass.length / 8;

        gfx.assertNoError( );
	}

	render(shader) {
        let gl = this.gfx.getContext();

        let mv = gfx.cameraView.multiply( GFX.Math.Transforms.rigidBodyTransform( this.orientation, this.position, this.scale ) );
		let normalMatrix = GFX.Math.Transforms.orientationMatrix3(mv);
		normalMatrix.invert();

        shader.prepare([
            { name: "useTexture", value: 1 },
            { name: Uniform.color, value: new GFX.Math.Vector4(1.0, 1.0, 1.0, 1.0) },
            { name: Uniform.texture0, value: 0 },
            { name: Uniform.texture1, value: 1 },
            { name: Uniform.projectionMatrix, transpose: false, value: gfx.perspectiveMatrix },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: true, value: normalMatrix },
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
            { name: Uniform.color, value: new GFX.Math.Vector4(0.7372549, 0.83921569, 1.0, 0.05) },
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

	update(delta) {
	}
}
