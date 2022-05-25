import { Renderable } from './renderable.js';
import { SubmarineModel } from '../assets/models/sub.js';

export class Submarine extends Renderable {
	constructor( gfx ) {
		super(gfx);
        let gl = gfx.getContext();

        this.vboHull           = gfx.bufferCreate( new Float32Array(SubmarineModel.hull), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboHull.itemSize  = 8;
        this.vboHull.itemCount = SubmarineModel.hull.length / 8;

        this.vboDivePlane           = gfx.bufferCreate( new Float32Array(SubmarineModel.divePlane), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboDivePlane.itemSize  = 8;
        this.vboDivePlane.itemCount = SubmarineModel.divePlane.length / 8;

        this.vboLeftProp           = gfx.bufferCreate( new Float32Array(SubmarineModel.leftProp), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboLeftProp.itemSize  = 8;
        this.vboLeftProp.itemCount = SubmarineModel.leftProp.length / 8;

        this.vboRightProp           = gfx.bufferCreate( new Float32Array(SubmarineModel.rightProp), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboRightProp.itemSize  = 8;
        this.vboRightProp.itemCount = SubmarineModel.rightProp.length / 8;

        this.vboLeftTorpedo           = gfx.bufferCreate( new Float32Array(SubmarineModel.leftTorpedo), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboLeftTorpedo.itemSize  = 8;
        this.vboLeftTorpedo.itemCount = SubmarineModel.leftTorpedo.length / 8;

        this.vboRightTorpedo           = gfx.bufferCreate( new Float32Array(SubmarineModel.rightTorpedo), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboRightTorpedo.itemSize  = 8;
        this.vboRightTorpedo.itemCount = SubmarineModel.rightTorpedo.length / 8;

		this.yangle = 0;
		this.angle = 0;
		this.propAngle = 0;
	}

	render(shader) {
        let gl = this.gfx.getContext();

		let transform = GFX.Math.Transforms.rigidBodyTransform( this.orientation,  this.position, this.scale );
        let mv = gfx.cameraView.multiply( transform );

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
            { name: Uniform.color, value: new GFX.Math.Vector4(0.95, 0.95, 0.95, 1.0) },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboDivePlane );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboDivePlane.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboDivePlane.itemCount );
        this.gfx.assertNoError( );

        let leftPropModelView = mv
					.multiply( GFX.Math.Transforms.translate( new GFX.Math.Vector3(2.35,-2,3) ) )
					.multiply( GFX.Math.Transforms.rotateZ( 100.0 * this.propAngle ) )
					.multiply( GFX.Math.Transforms.translate( new GFX.Math.Vector3(-2.35,2,-3) ) );

		let normalMatrixLeftProp = GFX.Math.Transforms.orientationMatrix3(leftPropModelView);
		//normalMatrixLeftProp.invert();

        shader.prepare([
            { name: Uniform.color, value: new GFX.Math.Vector4(0.88, 0.88, 1.0, 1.0) },
            { name: Uniform.modelView, transpose: false, value: leftPropModelView },
            { name: Uniform.normalMatrix, transpose: true, value: normalMatrixLeftProp },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboLeftProp );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboLeftProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboLeftProp.itemCount );
        this.gfx.assertNoError( );

        let rightPropModelView = mv
					.multiply( GFX.Math.Transforms.translate( new GFX.Math.Vector3(-2.35,-2,-3) ) )
					.multiply( GFX.Math.Transforms.rotateZ( 180 + 100.0 * this.propAngle ) )
					.multiply( GFX.Math.Transforms.translate( new GFX.Math.Vector3(2.35,2,3) ) );

		let normalMatrixRightProp = GFX.Math.Transforms.orientationMatrix3(rightPropModelView);
		//normalMatrixRightProp.invert();

        shader.prepare([
            { name: Uniform.color, value: new GFX.Math.Vector4(0.88, 0.88, 1.0, 1.0) },
            { name: Uniform.modelView, transpose: false, value: rightPropModelView },
            { name: Uniform.normalMatrix, transpose: true, value: normalMatrixRightProp },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboRightProp );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboRightProp.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboRightProp.itemCount );
        this.gfx.assertNoError( );

        shader.prepare([
            { name: Uniform.color, value: new GFX.Math.Vector4(1.0, 0.70, 0.70, 1.0) },
            { name: Uniform.modelView, transpose: false, value: mv },
            { name: Uniform.normalMatrix, transpose: false, value: normalMatrix },
        ]);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboLeftTorpedo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboLeftTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboLeftTorpedo.itemCount );
        this.gfx.assertNoError( );


        gl.bindBuffer( gl.ARRAY_BUFFER, this.vboRightTorpedo );
        gl.enableVertexAttribArray( shader.attributes.vertex );
        gl.vertexAttribPointer( shader.attributes.vertex, 3, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 0 );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.textureCoord );
        gl.vertexAttribPointer( shader.attributes.textureCoord, 2, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.enableVertexAttribArray( shader.attributes.normal );
        gl.vertexAttribPointer( shader.attributes.normal, 3, gl.FLOAT, false, this.vboRightTorpedo.itemSize * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT );
        this.gfx.assertNoError( );

        gl.drawArrays( gl.TRIANGLES, 0, this.vboRightTorpedo.itemCount );
        this.gfx.assertNoError( );

        gl.disableVertexAttribArray( shader.attributes.vertex );
        gl.disableVertexAttribArray( shader.attributes.normal );
        gl.disableVertexAttribArray( shader.attributes.textureCoord );
	}

	update(delta) {
		let XRADIUS = 34;
		let ZRADIUS = 26;
    	let center = new GFX.Math.Vector3(8, 0, 4);
    	let p = new GFX.Math.Vector3(center.x + XRADIUS * Math.cos(this.angle), 10 + center.y + 7 * Math.sin(this.yangle), center.z + ZRADIUS * Math.sin(this.angle));

		let left = new GFX.Math.Vector3( p.x - center.x, p.y - center.y, p.z - center.z );
		let forward = left.crossProduct( GFX.Math.Vector3.YUNIT );

    	this.position = GFX.Math.Transforms.translate( p );
		this.orientation = GFX.Math.Transforms.orientationMatrix4( forward, left, new GFX.Math.Vector3(0,1,0) );

		if( this.angle > Math.PI * 2 ) {
			this.angle = 0;
		}
		else {
			this.angle += 0.0006 * delta;
		}

		if( this.yangle > Math.PI * 2 ) {
			this.yangle = 0;
		}
		else {
			this.yangle += 0.0001 * delta;
		}

		if( this.propAngle > Math.PI * 2 ) {
			this.propAngle = 0;
		}
		else {
			this.propAngle += 0.0002 * delta;
		}
	}
}
