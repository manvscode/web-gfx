import { Renderable } from './renderable.js';
import { OceanFloorModel } from '../assets/models/oceanfloor.js';

export class OceanFloor extends Renderable {
	constructor( gfx ) {
		super(gfx);
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
	}

	render(shader) {
        var gl = this.gfx.getContext();

        let mv = gfx.cameraView.multiply( Lib3dMath.Transforms.rigidBodyTransform( this.orientation, this.position, this.scale ) );

        shader.prepare([
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

	update(delta) {
	}
}
