/*
 *  Author: Joe Marrero.  manvscode@gmail.com
 */
webgl.CoordinateFrame = function( orientation, position ) {
	if( this instanceof webgl.CoordinateFrame ) {
		this.modelMatrix = webgl.math.matrix4.IDENTITY;
		this.setOrientation( orientation );
		this.setPosition( position );
	}
	else {
		return new webgl.CoordinateFrame( orientation, position );
	}
};

webgl.CoordinateFrame.prototype = {
	constructor: webgl.CoordinateFrame,

	position: function() {
		return new webgl.math.vector3( -this.modelMatrix.m[12], -this.modelMatrix.m[13], -this.modelMatrix.m[14] );
	},

	setPosition: function( p ) {
		this.modelMatrix.m[12] = -p.x;
		this.modelMatrix.m[13] = -p.y;
		this.modelMatrix.m[14] = -p.z;
	},

	orientation: function() {
		return new webgl.math.matrix4(
			this.modelMatrix.m[ 0],   this.modelMatrix.m[ 1],  this.modelMatrix.m[ 2],  0.0,
			this.modelMatrix.m[ 4],   this.modelMatrix.m[ 5],  this.modelMatrix.m[ 6],  0.0,
			this.modelMatrix.m[ 8],   this.modelMatrix.m[ 9],  this.modelMatrix.m[10],  0.0,
			              0.0,                 0.0,                0.0,  1.0
		);
	},

	setOrientation: function( o ) {
		if( o instanceof webgl.math.matrix3 ) {
			this.modelMatrix.m[ 0] = o.m[0];
			this.modelMatrix.m[ 1] = o.m[1];
			this.modelMatrix.m[ 2] = o.m[2];
			this.modelMatrix.m[ 4] = o.m[3];
			this.modelMatrix.m[ 5] = o.m[4];
			this.modelMatrix.m[ 6] = o.m[5];
			this.modelMatrix.m[ 8] = o.m[6];
			this.modelMatrix.m[ 9] = o.m[7];
			this.modelMatrix.m[10] = o.m[8];
		}
		else if( o instanceof webgl.math.matrix4 ) {
			this.modelMatrix.m[ 0] = o.m[ 0];
			this.modelMatrix.m[ 1] = o.m[ 1];
			this.modelMatrix.m[ 2] = o.m[ 2];
			this.modelMatrix.m[ 4] = o.m[ 4];
			this.modelMatrix.m[ 5] = o.m[ 5];
			this.modelMatrix.m[ 6] = o.m[ 6];
			this.modelMatrix.m[ 8] = o.m[ 8];
			this.modelMatrix.m[ 9] = o.m[ 9];
			this.modelMatrix.m[10] = o.m[10];
		}
		else {
			throw "setOrientation() expected a matrix";
		}
	},

	modelMatrix: function() {
		return this.modelMatrix;
	},

	xAxis: function() { /* Depending on implemenation: this may or may not be normalized */
		return new webgl.math.vector3( this.modelMatrix.m[0], this.modelMatrix.m[4], this.modelMatrix.m[8] );
	},

	yAxis: function() { /* Depending on implemenation: this may or may not be normalized */
		return new webgl.math.vector3( this.modelMatrix.m[1], this.modelMatrix.m[5], this.modelMatrix.m[9] );
	},

	zAxis: function() { /* Depending on implemenation: this may or may not be normalized */
		return new webgl.math.vector3( this.modelMatrix.m[2], this.modelMatrix.m[6], this.modelMatrix.m[10] );
	},
};
