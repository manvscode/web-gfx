"use strict";
const m3d = (function() {
	const M = {
		toRadians: function(degrees) { return degrees * this.RADIANS_PER_DEGREE; },
		toDegrees: function(radians) { return radians * this.DEGREES_PER_RANDIAN; },
		integerMax: function(x, y) { return (x) ^ (((x) ^ (y)) & -((x) < (y))); },
		integerMin: function(x, y) { return (y) ^ (((x) ^ (y)) & -((x) < (y))); },
		lerp: function(a, x0, x1) { return (x0) + (a) * ((x1) - (x0)); },
		bilerp: function(a, b, x0, x1, x2, x3) { return this.lerp( b, this.lerp( a, x0, x1 ), this.lerp( a, x2, x3 ) ); },
		uniform: function() { return Math.random(); },
		uniformRange: function(min, max) { var diff = max - min; return min + this.uniform() * diff; },
		uniformUnit: function() { return 2 * this.uniform() - 1; },
		clamp: function(x, min, max) { return Math.min( Math.max(x, min), max ); },
		format: function(n) { var result = n.toFixed(3); if(n >= 0) { result = " "+result; } return result; }
	};

	Object.defineProperties( M, {
		VERSION: {
			value: "1.0",
			writable: false,
			enumerable: true,
			configurable: false,
		},
		SCALAR_EPSILON: {
			value: Math.EPSILON,
			writable: false,
			enumerable: true,
			configurable: true,
		},
		HALF_PI: {
			value: Math.PI / 2.0,
			writable: false,
			enumerable: true,
			configurable: true,
		},
		PI: {
			value: Math.PI,
			writable: false,
			enumerable: true,
			configurable: true,
		},
		TWO_PI: {
			value: 2 * Math.PI,
			writable: false,
			enumerable: true,
			configurable: true,
		},
		RADIANS_PER_DEGREE: {
			value: (Math.PI / 180.0),
			writable: false,
			enumerable: true,
			configurable: true,
		},
		DEGREES_PER_RANDIAN: {
			value: (180.0 / Math.PI),
			writable: false,
			enumerable: true,
			configurable: true,
		},
	});

	return M;
}());
/*
 * 2D vector
 */
m3d.Vec2 = function( x, y ) {
	if( this instanceof m3d.Vec2 ) {
		this.x = x || 0;
		this.y = y || 0;
	}
	else {
		return new m3d.Vec2( x, y );
	}
};

m3d.Vec2.prototype = {
	add: function( v ) {
		return new m3d.Vec2( this.x + v.x, this.y + v.y );
	},

	subtract: function( v ) {
		return new m3d.Vec2( this.x - v.x, this.y - v.y );
	},

	multiply: function( s ) {
		return new m3d.Vec2( this.x * s, this.y * s );
	},

	scale: function( s ) {
		return this.multiply( s );
	},

	dotProduct: function( v ) {
		return this.x * v.x + this.y * v.y;
	},

	crossProduct: function( v ) {
		return new m3d.Vec2( this.y, -this.x );
	},

	determinant: function( v ) {
		return this.x * v.y - v.x * this.y;
	},

	magnitude: function( ) {
		return Math.sqrt( this.x * this.x + this.y * this.y );
	},

	distance: function( v ) {
		return Math.sqrt(
			(this.x - v.x) * (this.x - v.x) +
			(this.y - v.y) * (this.y - v.y)
		);
	},

	angle: function( v ) {
		let dot_product = this.dot_product( v );
		let a_length    = this.magnitude( );
		let b_length    = v.magnitude( );
		return Math.acos( dot_product / ( a_length * b_length ) );
	},

	normalize: function( ) {
		let length = this.magnitude();
		if( length > 0.0 ) {
			this.x /= length;
			this.y /= length;
		}
		return this;
	},

	isNormalized: function( ) {
		return Math.abs(length - 1.0) < Number.EPSILON;
	},

	negate: function( ) {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	zero: function( ) {
		this.x = 0.0;
		this.y = 0.0;
		return this;
	},

	lerp: function( a, b, s ) {
		return new m3d.Vec2(
			m3d.lerp( s, a.x, b.x ),
			m3d.lerp( s, a.y, b.y )
		);
	},

	maxComponent: function( v ) {
		return Math.max( v.x, v.y );
	},

	minComponent: function( v ) {
		return Math.min( v.x, v.y );
	},

	toString: function( ) {
		return "(" + m3d.format(this.x) + ", " + m3d.format(this.y) + ")";
	},
};

m3d.Vec2.ZERO = (function() {
	let z = new m3d.Vec2( 0, 0 );
	Object.freeze( z );
	return z;
}());

m3d.Vec2.ONE = (function() {
	let z = new m3d.Vec2( 1, 1 );
	Object.freeze( z );
	return z;
}());

m3d.Vec2.XUNIT = (function() {
	let x = new m3d.Vec2( 1, 0 );
	Object.freeze( x );
	return x;
}());

m3d.Vec2.YUNIT = (function() {
	let y = new m3d.Vec2( 0, 1 );
	Object.freeze( y );
	return y;
}());
/*
 * 3D vector
 */
m3d.Vec3 = function( x, y, z ) {
	if( this instanceof m3d.Vec3) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	else {
		return new m3d.Vec3( x, y, z );
	}
};

m3d.Vec3.prototype = {
	add: function( v ) {
		return new m3d.Vec3( this.x + v.x, this.y + v.y, this.z + v.z );
	},

	subtract: function( v ) {
		return new m3d.Vec3( this.x - v.x, this.y - v.y, this.z - v.z );
	},

	multiply: function( s ) {
		return new m3d.Vec3( this.x * s, this.y * s, this.z * s );
	},

	scale: function( s ) {
		return this.multiply( s );
	},

	dotProduct: function( v ) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	},

	crossProduct: function( v ) {
		return new m3d.Vec3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	},

	magnitude: function( ) {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
	},

	distance: function( v ) {
		return Math.sqrt(
			(this.x - v.x) * (this.x - v.x) +
			(this.y - v.y) * (this.y - v.y) +
			(this.z - v.z) * (this.z - v.z)
		);
	},

	angle: function( v ) {
		let dot_product = this.dotProduct( v );
		let a_length    = this.magnitude( );
		let b_length    = v.magnitude( );

		return Math.acos( dot_product / ( a_length * b_length ) );
	},

	normalize: function( ) {
		let length = this.magnitude();
		if( length > 0.0 ) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}
		return this;
	},

	isNormalized: function( ) {
		let length = this.magnitude();
		return (Math.abs(length - 1.0) < Number.EPSILON);
	},

	negate: function( ) {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	},

	zero: function( ) {
		this.x = 0.0;
		this.y = 0.0;
		this.z = 0.0;
		return this;
	},

	lerp: function( a, b, s ) {
		return new m3d.Vec3(
			m3d.lerp( s, a.x, b.x ),
			m3d.lerp( s, a.y, b.y ),
			m3d.lerp( s, a.z, b.z )
		);
	},

	maxComponent: function( v ) {
		return Math.max( Math.max(v.x, v.y), v.z );
	},

	minComponent: function( v ) {
		return Math.min( Math.min(v.x, v.y), v.z );
	},

	toString: function( ) {
		return "(" + m3d.format(this.x) + ", " + m3d.format(this.y) + ", " + m3d.format(this.z) + ")";
	},
};

m3d.Vec3.ZERO = (function() {
	let z = new m3d.Vec3( 0, 0, 0 );
	Object.freeze( z );
	return z;
}());

m3d.Vec3.ONE = (function() {
	let z = new m3d.Vec3( 1, 1, 1 );
	Object.freeze( z );
	return z;
}());

m3d.Vec3.XUNIT = (function() {
	let x = new m3d.Vec3( 1, 0, 0 );
	Object.freeze( x );
	return x;
}());

m3d.Vec3.YUNIT = (function() {
	let y = new m3d.Vec3( 0, 1, 0 );
	Object.freeze( y );
	return y;
}());

m3d.Vec3.ZUNIT = (function() {
	let z = new m3d.Vec3( 0, 0, 1 );
	Object.freeze( z );
	return z;
}());
/*
 * 4D vector
 */
m3d.Vec4 = function( x, y, z, w ) {
	if( this instanceof m3d.Vec4) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
	}
	else {
		return new m3d.Vec4( x, y, z, w );
	}
};

m3d.Vec4.prototype = {
	add: function( v ) {
		return new m3d.Vec4(
			this.x + v.x,
			this.y + v.y,
			this.z + v.z,
			this.w + v.w
		);
	},

	subtract: function( v ) {
		return new m3d.Vec4(
			this.x - v.x,
			this.y - v.y,
			this.z - v.z,
			this.w - v.w
		);
	},

	multiply: function( s ) {
		return new m3d.Vec4(
			this.x * s,
			this.y * s,
			this.z * s,
			this.w * s
		);
	},

	scale: function( s ) {
		return this.multiply( s );
	},

	dotProduct: function( v ) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	},

	magnitude: function( ) {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );
	},

	distance: function( v ) {
		return Math.sqrt(
			(this.x - v.x) * (this.x - v.x) +
			(this.y - v.y) * (this.y - v.y) +
			(this.z - v.z) * (this.z - v.z) +
			(this.w - v.w) * (this.w - v.w)
		);
	},

	angle: function( v ) {
		let dot_product = this.dotProduct( v );
		let a_length    = this.magnitude( );
		let b_length    = v.magnitude( );

		return Math.acos( dot_product / ( a_length * b_length ) );
	},

	normalize: function( ) {
		let inverse_length = 1.0 / this.magnitude();
		this.x *= inverse_length;
		this.y *= inverse_length;
		this.z *= inverse_length;
		this.w *= inverse_length;
		return this;
	},

	isNormalized: function( ) {
		let length = this.magnitude();
		return (Math.abs(length - 1.0) < Number.EPSILON);
	},

	negate: function( ) {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.w = -this.w;
		return this;
	},

	zero: function( ) {
		this.x = 0.0;
		this.y = 0.0;
		this.z = 0.0;
		this.w = 0.0;
		return this;
	},

	lerp: function( a, b, s ) {
		return new m3d.Vec4(
			m3d.lerp( s, a.x, b.x ),
			m3d.lerp( s, a.y, b.y ),
			m3d.lerp( s, a.z, b.z ),
			m3d.lerp( s, a.w, b.w )
		);
	},

	maxComponent: function( v ) {
		return Math.max( Math.max( Math.max(v.x, v.y), v.z ), v.w );
	},

	minComponent: function( v ) {
		return Math.min( Math.min( Math.min(v.x, v.y), v.z ), v.w );
	},

	toString: function( ) {
		return "(" + m3d.format(this.x) + ", " + m3d.format(this.y) + ", " + m3d.format(this.z) + ", " + m3d.format(this.w) + ")";
	},
};

m3d.Vec4.ZERO = (function() {
	let z = new m3d.Vec4( 0, 0, 0, 0 );
	Object.freeze( z );
	return z;
}());

m3d.Vec4.ONE = (function() {
	let z = new m3d.Vec4( 1, 1, 1, 1 );
	Object.freeze( z );
	return z;
}());

m3d.Vec4.XUNIT = (function() {
	let x = new m3d.Vec4( 1, 0, 0, 0 );
	Object.freeze( x );
	return x;
}());

m3d.Vec4.YUNIT = (function() {
	let y = new m3d.Vec4( 0, 1, 0, 0 );
	Object.freeze( y );
	return y;
}());

m3d.Vec4.ZUNIT = (function() {
	let z = new m3d.Vec4( 0, 0, 1, 0 );
	Object.freeze( z );
	return z;
}());

m3d.Vec4.WUNIT = (function() {
	let w = new m3d.Vec4( 0, 0, 0, 1 );
	Object.freeze( w );
	return w;
}());
/*
 * 2D matrix
 */
m3d.Mat2 = function( a, b, c, d ) {
	if( this instanceof m3d.Mat2) {
		this.m = [a || 0, b || 0,
		          c || 0, d || 0];
	}
	else {
		return new m3d.Mat2( a, b, c, d );
	}
};

m3d.Mat2.prototype = {
	identity: function( ) {
		return this.m = m3d.Mat2.IDENITY;
	},

	zero: function( ) {
		return this.m = m3d.Mat2.ZERO;
	},

	determinant: function( ) {
		return this.m[ 0 ] * this.m[ 3 ] - this.m[ 1 ] * this.m[ 2 ];
	},

	multiplyMatrix: function( m ) {
		return new m3d.Mat2(
			this.m[ 0 ] * m.m[ 0 ] + this.m[ 2 ] * m.m[ 1 ],
			this.m[ 1 ] * m.m[ 0 ] + this.m[ 3 ] * m.m[ 1 ],
			this.m[ 0 ] * m.m[ 2 ] + this.m[ 2 ] * m.m[ 3 ],
			this.m[ 1 ] * m.m[ 2 ] + this.m[ 3 ] * m.m[ 3 ]
		);
	},

	multiplyVector: function( v ) {
		return new m3d.Vec2(
			this.m[ 0 ] * v.x + this.m[ 2 ] * v.y,
			this.m[ 1 ] * v.x + this.m[ 3 ] * v.y
		);
	},

	multiply: function( o ) {
		if( o instanceof m3d.Vec2 ) {
			return this.multiplyVector( o );
		}
		else {
			return this.multiplyMatrix( o );
		}
	},

	invert: function( ) {
		let det = this.determinant( );

		if( det > Number.EPSILON )
		{
			{
				let tmp = this.m[ 0 ];
				this.m[ 0 ] = this.m[ 3 ];
				this.m[ 3 ] = tmp;

				tmp = this.m[ 1 ];
				this.m[ 1 ] = -this.m[ 2 ];
				this.m[ 2 ] = -tmp;
			}

			this.m[ 0 ] /= det;
			this.m[ 1 ] /= det;
			this.m[ 2 ] /= det;
			this.m[ 3 ] /= det;

			return true;
		}

		return false;
	},

	transpose: function( ) {
		let tmp = this.m[ 1 ];
		this.m[ 1 ] = this.m[ 2 ];
		this.m[ 2 ] = tmp;
	},

	x_vector: function() {
		let arr = this.m.slice( 0, 2 );
		return new m3d.Vec2( arr[0], arr[1] );
	},

	y_vector: function() {
		let arr = this.m.slice( 2, 4 );
		return new m3d.Vec2( arr[0], arr[1] );
	},

	toString: function( ) {
		return "|" + m3d.format(this.m[0]) + " " + m3d.format(this.m[2]) + "|\n" +
			   "|" + m3d.format(this.m[1]) + " " + m3d.format(this.m[3]) + "|\n";
	},
};

m3d.Mat2.IDENTITY = (function() {
	let i = new m3d.Mat2( 1, 0,
	                  0, 1 );
	Object.freeze( i );
	return i;
}());

m3d.Mat2.ZERO = (function() {
	let z = new m3d.Mat2( 0, 0,
	                  0, 0 );
	Object.freeze( z );
	return z;
}());
/*
 * 3D matrix
 */
m3d.Mat3 = function( a, b, c, d, e, f, g, h, i ) {
	if( this instanceof m3d.Mat3 ) {
		this.m = [a || 0, b || 0, c || 0,
		          d || 0, e || 0, f || 0,
		          g || 0, h || 0, i || 0];
	}
	else {
		return new m3d.Mat3( a, b, c, d, e, f, g, h, i );
	}
};

m3d.Mat3.fromMatrix = function( m ) {
	if( m instanceof m3d.Mat4 ) {
		return new m3d.Mat4(
			m.m[ 0], m.m[ 1], m.m[ 2], 0,
			m.m[ 4], m.m[ 5], m.m[ 6], 0,
			m.m[ 8], m.m[ 9], m.m[10], 0,
			      0,       0,       0, 1
		);
	}
	else if( m instanceof m3d.Mat3 ) {
		return new m3d.Mat3(
			m.m[0], m.m[1], m.m[2],
			m.m[3], m.m[4], m.m[5],
			m.m[6], m.m[7], m.m[8]
		);
	}
};

m3d.Mat3.fromAxisAngle = function( axis, angle ) {
	let sin_a           = Math.sin(angle);
	let cos_a           = Math.cos(angle);
	let one_minus_cos_a = 1 - cos_a;

    let ax = axis.clone();
    ax.normalize( );

	return new m3d.Mat3(
		cos_a + (ax.x * ax.x) * one_minus_cos_a,
		ax.y * ax.x * one_minus_cos_a + ax.z * sin_a,
		ax.z * ax.x * one_minus_cos_a - ax.y * sin_a,

		ax.x * ax.y * one_minus_cos_a - ax.z * sin_a,
		cos_a + (ax.y * ax.y) * one_minus_cos_a,
		ax.z * ax.y * one_minus_cos_a + ax.x * sin_a,

		ax.x * ax.z * one_minus_cos_a + ax.y * sin_a,
		ax.y * ax.z * one_minus_cos_a - ax.x * sin_a,
		cos_a + (ax.z * ax.z) * one_minus_cos_a
	);
};

m3d.Mat3.prototype = {
	identity: function( ) {
		return this.m = m3d.Mat3.IDENITY.m;
	},

	zero: function( ) {
		return this.m = m3d.Mat3.ZERO.m;
	},

	determinant: function( ) {
		return this.m[ 0 ] * this.m[ 4 ] * this.m[ 8 ] +
			   this.m[ 3 ] * this.m[ 7 ] * this.m[ 2 ] +
			   this.m[ 6 ] * this.m[ 1 ] * this.m[ 5 ] -
			   this.m[ 6 ] * this.m[ 4 ] * this.m[ 2 ] -
			   this.m[ 3 ] * this.m[ 1 ] * this.m[ 8 ] -
			   this.m[ 0 ] * this.m[ 7 ] * this.m[ 5 ];
	},

	multiplyMatrix: function( m ) {
		return new m3d.Mat3(
			this.m[ 0 ] * m.m[ 0 ] + this.m[ 3 ] * m.m[ 1 ] + this.m[ 6 ] * m.m[ 2 ],
			this.m[ 1 ] * m.m[ 0 ] + this.m[ 4 ] * m.m[ 1 ] + this.m[ 7 ] * m.m[ 2 ],
			this.m[ 2 ] * m.m[ 0 ] + this.m[ 5 ] * m.m[ 1 ] + this.m[ 8 ] * m.m[ 2 ],

			this.m[ 0 ] * m.m[ 3 ] + this.m[ 3 ] * m.m[ 4 ] + this.m[ 6 ] * m.m[ 5 ],
			this.m[ 1 ] * m.m[ 3 ] + this.m[ 4 ] * m.m[ 4 ] + this.m[ 7 ] * m.m[ 5 ],
			this.m[ 2 ] * m.m[ 3 ] + this.m[ 5 ] * m.m[ 4 ] + this.m[ 8 ] * m.m[ 5 ],

			this.m[ 0 ] * m.m[ 6 ] + this.m[ 3 ] * m.m[ 7 ] + this.m[ 6 ] * m.m[ 8 ],
			this.m[ 1 ] * m.m[ 6 ] + this.m[ 4 ] * m.m[ 7 ] + this.m[ 7 ] * m.m[ 8 ],
			this.m[ 2 ] * m.m[ 6 ] + this.m[ 5 ] * m.m[ 7 ] + this.m[ 8 ] * m.m[ 8 ]
		);
	},

	multiplyVector: function( v ) {
		return new m3d.Vec3(
			this.m[ 0 ] * v.x  +  this.m[ 3 ] * v.y  +  this.m[ 6 ] * v.z,
			this.m[ 1 ] * v.x  +  this.m[ 4 ] * v.y  +  this.m[ 7 ] * v.z,
			this.m[ 2 ] * v.x  +  this.m[ 5 ] * v.y  +  this.m[ 8 ] * v.z
		);
	},

	multiply: function( o ) {
		if( o instanceof m3d.Vec3) {
			return this.multiplyVector( o );
		}
		else {
			return this.multiplyMatrix( o );
		}
	},

	cofactor: function() {
		return new m3d.Mat3(
			+(this.m[4] * this.m[8] - this.m[5] * this.m[7]),
			-(this.m[3] * this.m[8] - this.m[5] * this.m[6]),
			+(this.m[3] * this.m[7] - this.m[4] * this.m[6]),

			-(this.m[1] * this.m[8] - this.m[2] * this.m[7]),
			+(this.m[0] * this.m[8] - this.m[2] * this.m[6]),
			-(this.m[0] * this.m[7] - this.m[1] * this.m[6]),

			+(this.m[1] * this.m[5] - this.m[2] * this.m[4]),
			-(this.m[0] * this.m[5] - this.m[2] * this.m[3]),
			+(this.m[0] * this.m[4] - this.m[1] * this.m[3])
		);
	},

	transpose: function() {
		let tmp1 = this.m[ 1 ];
		let tmp2 = this.m[ 2 ];
		let tmp3 = this.m[ 5 ];

		this.m[ 1 ] = this.m[ 3 ];
		this.m[ 2 ] = this.m[ 6 ];
		this.m[ 5 ] = this.m[ 7 ];

		this.m[ 3 ] = tmp1;
		this.m[ 6 ] = tmp2;
		this.m[ 7 ] = tmp3;
	},

	adjoint: function() {
		let cofactor_matrix = this.cofactor();
		cofactor_matrix.transpose();
		this.m = cofactor_matrix.m;
	},

	invert: function() {
		let det = this.determinant();

		if( Math.abs(det) > Number.EPSILON ) // testing if not zero
		{
			this.adjoint( );

			this.m[ 0 ] /= det;
			this.m[ 1 ] /= det;
			this.m[ 2 ] /= det;
			this.m[ 3 ] /= det;
			this.m[ 4 ] /= det;
			this.m[ 5 ] /= det;
			this.m[ 6 ] /= det;
			this.m[ 7 ] /= det;
			this.m[ 8 ] /= det;

			return true;
		}

		return false;
	},

	x_vector: function() {
		let arr = this.m.slice( 0, 4 );
		return new m3d.Vec3( arr[0], arr[1], arr[2] );
	},

	y_vector: function() {
		let arr = this.m.slice( 3, 6 );
		return new m3d.Vec3( arr[0], arr[1], arr[2] );
	},

	z_vector: function() {
		let arr = this.m.slice( 6, 9 );
		return new m3d.Vec3( arr[0], arr[1], arr[2] );
	},

	toString: function( ) {
		return "|" + m3d.format(this.m[0]) + " " + m3d.format(this.m[3]) + " " + m3d.format(this.m[6]) + "|\n" +
			   "|" + m3d.format(this.m[1]) + " " + m3d.format(this.m[4]) + " " + m3d.format(this.m[7]) + "|\n" +
			   "|" + m3d.format(this.m[2]) + " " + m3d.format(this.m[5]) + " " + m3d.format(this.m[8]) + "|\n";
	},
};

m3d.Mat3.IDENTITY = (function() {
	let i = new m3d.Mat3( 1, 0, 0,
	                  0, 1, 0,
	                  0, 0, 1 );
	Object.freeze( i );
	return i;
}());

m3d.Mat3.ZERO = (function() {
	let z = new m3d.Mat3( 0, 0, 0,
	                  0, 0, 0,
	                  0, 0, 0 );
	Object.freeze( z );
	return z;
}());
/*
 * 4D Affine Matrix
 */
m3d.Mat4 = function( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ) {
	if( this instanceof m3d.Mat4) {
		this.m = [a || 0, b || 0, c || 0, d || 0,
		          e || 0, f || 0, g || 0, h || 0,
		          i || 0, j || 0, k || 0, l || 0,
		          m || 0, n || 0, o || 0, p || 0];
	}
	else {
		return new m3d.Mat4( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p );
	}
};

m3d.Mat4.fromMatrix = function( m ) {
	if( m instanceof m3d.Mat4 ) {
		return new m3d.Mat4(
			m.m[ 0], m.m[ 1], m.m[ 2], m.m[ 3],
			m.m[ 4], m.m[ 5], m.m[ 6], m.m[ 7],
			m.m[ 8], m.m[ 9], m.m[10], m.m[11],
			m.m[12], m.m[13], m.m[14], m.m[15]
		);
	}
	else if( m instanceof m3d.Mat3 ) {
		return new m3d.Mat3(
			m.m[0], m.m[1], m.m[2], 0,
			m.m[3], m.m[4], m.m[5], 0,
			m.m[6], m.m[7], m.m[8], 0,
			     0,      0,      0, 1
		);
	}
};

m3d.Mat4.fromAxisAngle = function( axis, angle ) {
	let sin_a           = scaler_sin(angle);
	let cos_a           = scaler_cos(angle);
	let one_minus_cos_a = 1 - cos_a;

	let ax = axis.clone();
    ax.normalize( );

	return new m3d.Mat4(
		cos_a + (ax.x * ax.x) * one_minus_cos_a,
		ax.y * ax.x * one_minus_cos_a + ax.z * sin_a,
		ax.z * ax.x * one_minus_cos_a - ax.y * sin_a,
		0.0,

		ax.x * ax.y * one_minus_cos_a - ax.z * sin_a,
		cos_a + (ax.y * ax.y) * one_minus_cos_a,
		ax.z * ax.y * one_minus_cos_a + ax.x * sin_a,
		0.0,

		ax.x * ax.z * one_minus_cos_a + ax.y * sin_a,
		ax.y * ax.z * one_minus_cos_a - ax.x * sin_a,
		cos_a + (ax.z * ax.z) * one_minus_cos_a,
		0.0,

		0.0,
		0.0,
		0.0,
		1.0
	);
};

m3d.Mat4.prototype = {
	identity: function( ) {
		return this.m = IDENITY;
	},

	zero: function( ) {
		return this.m = ZERO;
	},

	determinant: function() {
		let d1 = this.m[5] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) + this.m[7] * (this.m[9] * this.m[14] - this.m[13] * this.m[10]);
		let d2 = this.m[4] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[14] - this.m[12] * this.m[10]);
		let d3 = this.m[4] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) - this.m[5] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[13] - this.m[12] * this.m[9]);
		let d4 = this.m[4] * (this.m[9] * this.m[14] - this.m[13] * this.m[10]) - this.m[5] * (this.m[8] * this.m[14] - this.m[12] * this.m[10]) + this.m[6] * (this.m[8] * this.m[13] - this.m[12] * this.m[9]);
		return this.m[0]*d1 - this.m[1]*d2 + this.m[2]*d3 - this.m[3]*d4;
	},

	multiplyMatrix: function( m ) {
		return new m3d.Mat4(
			this.m[ 0] * m.m[ 0]  +  this.m[ 4] * m.m[ 1]  +  this.m[ 8] * m.m[ 2]  +  this.m[12] * m.m[ 3],
			this.m[ 1] * m.m[ 0]  +  this.m[ 5] * m.m[ 1]  +  this.m[ 9] * m.m[ 2]  +  this.m[13] * m.m[ 3],
			this.m[ 2] * m.m[ 0]  +  this.m[ 6] * m.m[ 1]  +  this.m[10] * m.m[ 2]  +  this.m[14] * m.m[ 3],
			this.m[ 3] * m.m[ 0]  +  this.m[ 7] * m.m[ 1]  +  this.m[11] * m.m[ 2]  +  this.m[15] * m.m[ 3],

			this.m[ 0] * m.m[ 4]  +  this.m[ 4] * m.m[ 5]  +  this.m[ 8] * m.m[ 6]  +  this.m[12] * m.m[ 7],
			this.m[ 1] * m.m[ 4]  +  this.m[ 5] * m.m[ 5]  +  this.m[ 9] * m.m[ 6]  +  this.m[13] * m.m[ 7],
			this.m[ 2] * m.m[ 4]  +  this.m[ 6] * m.m[ 5]  +  this.m[10] * m.m[ 6]  +  this.m[14] * m.m[ 7],
			this.m[ 3] * m.m[ 4]  +  this.m[ 7] * m.m[ 5]  +  this.m[11] * m.m[ 6]  +  this.m[15] * m.m[ 7],

			this.m[ 0] * m.m[ 8]  +  this.m[ 4] * m.m[ 9]  +  this.m[ 8] * m.m[10]  +  this.m[12] * m.m[11],
			this.m[ 1] * m.m[ 8]  +  this.m[ 5] * m.m[ 9]  +  this.m[ 9] * m.m[10]  +  this.m[13] * m.m[11],
			this.m[ 2] * m.m[ 8]  +  this.m[ 6] * m.m[ 9]  +  this.m[10] * m.m[10]  +  this.m[14] * m.m[11],
			this.m[ 3] * m.m[ 8]  +  this.m[ 7] * m.m[ 9]  +  this.m[11] * m.m[10]  +  this.m[15] * m.m[11],

			this.m[ 0] * m.m[12]  +  this.m[ 4] * m.m[13]  +  this.m[ 8] * m.m[14]  +  this.m[12] * m.m[15],
			this.m[ 1] * m.m[12]  +  this.m[ 5] * m.m[13]  +  this.m[ 9] * m.m[14]  +  this.m[13] * m.m[15],
			this.m[ 2] * m.m[12]  +  this.m[ 6] * m.m[13]  +  this.m[10] * m.m[14]  +  this.m[14] * m.m[15],
			this.m[ 3] * m.m[12]  +  this.m[ 7] * m.m[13]  +  this.m[11] * m.m[14]  +  this.m[15] * m.m[15]
		);
	},

	multiplyVector: function( v ) {
		return new m3d.Vec4(
			this.m[ 0] * v.x  +  this.m[ 4] * v.y  +  this.m[ 8] * v.z  +  this.m[12] * v.w,
			this.m[ 1] * v.x  +  this.m[ 5] * v.y  +  this.m[ 9] * v.z  +  this.m[13] * v.w,
			this.m[ 2] * v.x  +  this.m[ 6] * v.y  +  this.m[10] * v.z  +  this.m[14] * v.w,
			this.m[ 3] * v.x  +  this.m[ 7] * v.y  +  this.m[11] * v.z  +  this.m[15] * v.w
		);
	},

	multiply: function( o ) {
		if( o instanceof m3d.Vec4 ) {
			return this.multiplyVector( o );
		}
		else {
			return this.multiplyMatrix( o );
		}
	},

	cofactor: function() {
		return new m3d.Mat4(
			+(this.m[5] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) + this.m[7] * (this.m[9] * this.m[14] - this.m[13] * this.m[10])),
			-(this.m[4] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[14] - this.m[12] * this.m[10])),
			+(this.m[4] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) - this.m[5] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[13] - this.m[12] * this.m[9])),
			-(this.m[4] * (this.m[9] * this.m[14] - this.m[13] * this.m[10]) - this.m[5] * (this.m[8] * this.m[14] - this.m[12] * this.m[10]) + this.m[6] * (this.m[8] * this.m[13] - this.m[12] * this.m[9])),
			-(this.m[1] * (this.m[10]*this.m[15]-this.m[14]*this.m[11]) - this.m[2] * (this.m[9]*this.m[15]-this.m[13]*this.m[11]) + this.m[3] * (this.m[9]*this.m[14]-this.m[13]*this.m[10])),
			+(this.m[0] * (this.m[10]*this.m[15]-this.m[14]*this.m[11]) - this.m[2] * (this.m[8]*this.m[15]-this.m[12]*this.m[11]) + this.m[3] * (this.m[8]*this.m[14]-this.m[12]*this.m[10])),
			-(this.m[0] * (this.m[9]*this.m[15]-this.m[13]*this.m[11]) - this.m[1] * (this.m[8]*this.m[15]-this.m[12]*this.m[11]) + this.m[3] * (this.m[8]*this.m[13]-this.m[12]*this.m[9])),
			+(this.m[0] * (this.m[9]*this.m[14]-this.m[13]*this.m[10]) - this.m[1] * (this.m[8]*this.m[14]-this.m[12]*this.m[10]) + this.m[2] * (this.m[8]*this.m[13]-this.m[12]*this.m[9])),
			+(this.m[1] * (this.m[6]*this.m[15]-this.m[14]*this.m[7]) - this.m[2] * (this.m[5]*this.m[15]-this.m[13]*this.m[7]) + this.m[3] * (this.m[5]*this.m[14]-this.m[13]*this.m[6])),
			-(this.m[0] * (this.m[6]*this.m[15]-this.m[14]*this.m[7]) - this.m[2] * (this.m[4]*this.m[15]-this.m[12]*this.m[7]) + this.m[3] * (this.m[4]*this.m[14]-this.m[12]*this.m[6])),
			+(this.m[0] * (this.m[5]*this.m[15]-this.m[13]*this.m[7]) - this.m[1] * (this.m[4]*this.m[15]-this.m[12]*this.m[7]) + this.m[3] * (this.m[4]*this.m[13]-this.m[12]*this.m[5])),
			-(this.m[0] * (this.m[5]*this.m[14]-this.m[13]*this.m[6]) - this.m[1] * (this.m[4]*this.m[14]-this.m[12]*this.m[6]) + this.m[2] * (this.m[4]*this.m[13]-this.m[12]*this.m[5])),
			-(this.m[1] * (this.m[6]*this.m[11]-this.m[10]*this.m[7]) - this.m[2] * (this.m[5]*this.m[11]-this.m[9]*this.m[7]) + this.m[3] * (this.m[5]*this.m[10]-this.m[9]*this.m[6])),
			+(this.m[0] * (this.m[6]*this.m[11]-this.m[10]*this.m[7]) - this.m[2] * (this.m[4]*this.m[11]-this.m[8]*this.m[7]) + this.m[3] * (this.m[4]*this.m[10]-this.m[8]*this.m[6])),
			-(this.m[0] * (this.m[5]*this.m[11]-this.m[9]*this.m[7]) - this.m[1] * (this.m[4]*this.m[11]-this.m[8]*this.m[7]) + this.m[3] * (this.m[4]*this.m[9]-this.m[8]*this.m[5])),
			+(this.m[0] * (this.m[5]*this.m[10]-this.m[9]*this.m[6]) - this.m[1] * (this.m[4]*this.m[10]-this.m[8]*this.m[6]) + this.m[2] * (this.m[4]*this.m[9]-this.m[8]*this.m[5]))
		);
	},

	transpose: function() {
		let tmp1 = this.m[ 1];
		let tmp2 = this.m[ 2];
		let tmp3 = this.m[ 3];
		let tmp4 = this.m[ 6];
		let tmp5 = this.m[ 7];
		let tmp6 = this.m[11];

		this.m[ 1] = this.m[ 4];
		this.m[ 2] = this.m[ 8];
		this.m[ 3] = this.m[12];
		this.m[ 6] = this.m[ 9];
		this.m[ 7] = this.m[13];
		this.m[11] = this.m[14];

		this.m[ 4] = tmp1;
		this.m[ 8] = tmp2;
		this.m[12] = tmp3;
		this.m[ 9] = tmp4;
		this.m[13] = tmp5;
		this.m[14] = tmp6;
	},

	adjoint: function() {
		let cofactor_matrix = this.cofactor( );
		cofactor_matrix.transpose( );
		this.m = cofactor_matrix.m;
	},

	invert: function() {
		let d1 = this.m[5] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) + this.m[7] * (this.m[9] * this.m[14] - this.m[13] * this.m[10]);
		let d2 = this.m[4] * (this.m[10] * this.m[15] - this.m[14] * this.m[11]) - this.m[6] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[14] - this.m[12] * this.m[10]);
		let d3 = this.m[4] * (this.m[9] * this.m[15] - this.m[13] * this.m[11]) - this.m[5] * (this.m[8] * this.m[15] - this.m[12] * this.m[11]) + this.m[7] * (this.m[8] * this.m[13] - this.m[12] * this.m[9]);
		let d4 = this.m[4] * (this.m[9] * this.m[14] - this.m[13] * this.m[10]) - this.m[5] * (this.m[8] * this.m[14] - this.m[12] * this.m[10]) + this.m[6] * (this.m[8] * this.m[13] - this.m[12] * this.m[9]);
		let det = this.m[0]*d1 - this.m[1]*d2 + this.m[2]*d3 - this.m[3]*d4;

		if( Math.abs(det) > Number.EPSILON ) // testing if not zero
		{
			let cofactor_matrix = new m3d.Mat4(
				+(d1),
				-(d2),
				+(d3),
				-(d4),
				-(this.m[1] * (this.m[10]*this.m[15]-this.m[14]*this.m[11]) - this.m[2] * (this.m[9]*this.m[15]-this.m[13]*this.m[11]) + this.m[3] * (this.m[9]*this.m[14]-this.m[13]*this.m[10])),
				+(this.m[0] * (this.m[10]*this.m[15]-this.m[14]*this.m[11]) - this.m[2] * (this.m[8]*this.m[15]-this.m[12]*this.m[11]) + this.m[3] * (this.m[8]*this.m[14]-this.m[12]*this.m[10])),
				-(this.m[0] * (this.m[9]*this.m[15]-this.m[13]*this.m[11]) - this.m[1] * (this.m[8]*this.m[15]-this.m[12]*this.m[11]) + this.m[3] * (this.m[8]*this.m[13]-this.m[12]*this.m[9])),
				+(this.m[0] * (this.m[9]*this.m[14]-this.m[13]*this.m[10]) - this.m[1] * (this.m[8]*this.m[14]-this.m[12]*this.m[10]) + this.m[2] * (this.m[8]*this.m[13]-this.m[12]*this.m[9])),
				+(this.m[1] * (this.m[6]*this.m[15]-this.m[14]*this.m[7]) - this.m[2] * (this.m[5]*this.m[15]-this.m[13]*this.m[7]) + this.m[3] * (this.m[5]*this.m[14]-this.m[13]*this.m[6])),
				-(this.m[0] * (this.m[6]*this.m[15]-this.m[14]*this.m[7]) - this.m[2] * (this.m[4]*this.m[15]-this.m[12]*this.m[7]) + this.m[3] * (this.m[4]*this.m[14]-this.m[12]*this.m[6])),
				+(this.m[0] * (this.m[5]*this.m[15]-this.m[13]*this.m[7]) - this.m[1] * (this.m[4]*this.m[15]-this.m[12]*this.m[7]) + this.m[3] * (this.m[4]*this.m[13]-this.m[12]*this.m[5])),
				-(this.m[0] * (this.m[5]*this.m[14]-this.m[13]*this.m[6]) - this.m[1] * (this.m[4]*this.m[14]-this.m[12]*this.m[6]) + this.m[2] * (this.m[4]*this.m[13]-this.m[12]*this.m[5])),
				-(this.m[1] * (this.m[6]*this.m[11]-this.m[10]*this.m[7]) - this.m[2] * (this.m[5]*this.m[11]-this.m[9]*this.m[7]) + this.m[3] * (this.m[5]*this.m[10]-this.m[9]*this.m[6])),
				+(this.m[0] * (this.m[6]*this.m[11]-this.m[10]*this.m[7]) - this.m[2] * (this.m[4]*this.m[11]-this.m[8]*this.m[7]) + this.m[3] * (this.m[4]*this.m[10]-this.m[8]*this.m[6])),
				-(this.m[0] * (this.m[5]*this.m[11]-this.m[9]*this.m[7]) - this.m[1] * (this.m[4]*this.m[11]-this.m[8]*this.m[7]) + this.m[3] * (this.m[4]*this.m[9]-this.m[8]*this.m[5])),
				+(this.m[0] * (this.m[5]*this.m[10]-this.m[9]*this.m[6]) - this.m[1] * (this.m[4]*this.m[10]-this.m[8]*this.m[6]) + this.m[2] * (this.m[4]*this.m[9]-this.m[8]*this.m[5]))
			);

			cofactor_matrix.transpose( );
			this.m = cofactor_matrix.m;

			this.m[ 0] /= det;
			this.m[ 1] /= det;
			this.m[ 2] /= det;
			this.m[ 3] /= det;
			this.m[ 4] /= det;
			this.m[ 5] /= det;
			this.m[ 6] /= det;
			this.m[ 7] /= det;
			this.m[ 8] /= det;
			this.m[ 9] /= det;
			this.m[10] /= det;
			this.m[11] /= det;
			this.m[12] /= det;
			this.m[13] /= det;
			this.m[14] /= det;
			this.m[15] /= det;

			return true;
		}

		return false;
	},

	x_vector: function() {
		let arr = this.m.slice( 0, 4 );
		return new Vec4( arr[0], arr[1], arr[2], arr[3] );
	},

	y_vector: function() {
		let arr = this.m.slice( 4, 8 );
		return new Vec4( arr[0], arr[1], arr[2], arr[3] );
	},

	z_vector: function() {
		let arr = this.m.slice( 8, 12 );
		return new Vec4( arr[0], arr[1], arr[2], arr[3] );
	},

	w_vector: function() {
		let arr = this.m.slice( 12, 16 );
		return new Vec4( arr[0], arr[1], arr[2], arr[3] );
	},

	toString: function( ) {
		return "|" + m3d.format(this.m[0]) + " " + m3d.format(this.m[4]) + " " + m3d.format(this.m[ 8]) + " " + m3d.format(this.m[12]) + "|\n" +
			   "|" + m3d.format(this.m[1]) + " " + m3d.format(this.m[5]) + " " + m3d.format(this.m[ 9]) + " " + m3d.format(this.m[13]) + "|\n" +
			   "|" + m3d.format(this.m[2]) + " " + m3d.format(this.m[6]) + " " + m3d.format(this.m[10]) + " " + m3d.format(this.m[14]) + "|\n" +
			   "|" + m3d.format(this.m[3]) + " " + m3d.format(this.m[7]) + " " + m3d.format(this.m[11]) + " " + m3d.format(this.m[15]) + "|\n";
	},
};

m3d.Mat4.IDENTITY = (function() {
	let i = new m3d.Mat4( 1, 0, 0, 0,
				      0, 1, 0, 0,
				      0, 0, 1, 0,
				      0, 0, 0, 1 );
	Object.freeze( i );
	return i;
}());

m3d.Mat4.ZERO = (function() {
	let z = new m3d.Mat4( 0, 0, 0, 0,
	                  0, 0, 0, 0,
	                  0, 0, 0, 0,
	                  0, 0, 0, 0 );
	Object.freeze( z );
	return z;
}());
/*
 * Quaternion
 */
m3d.Quat = function( x, y, z, w ) {
	if( this instanceof m3d.Quat) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
	}
	else {
		return new m3d.Quat( x, y, z, w );
	}
};

m3d.Quat.fromAxisAngle = function( axis, angle ) {
	let q = new m3d.Quat(
		Math.cos( angle / 2.0 ),
		axis.x * Math.sin( angle / 2.0 ),
		axis.y * Math.sin( angle / 2.0 ),
		axis.z * Math.sin( angle / 2.0 )
	);
	q.normalize( );
	return q;
};

m3d.Quat.fromVector = function( v ) {
	return new m3d.Quat(
		v.x,
		v.y,
		v.z,
		0.0
	);
};

m3d.Quat.fromMatrix = function( m ) {
	if( m instanceof m3d.Mat3) {
		return m3d.Quat.fromMat3( m );
	}
	else {
		return m3d.Quat.fromMat4( m );
	}
};

m3d.Quat.fromMat3 = function( m ) {
	let trace = m.m[0] + m.m[4] + m.m[8]; /* add the diagonal values */

	if( trace > 0.0 )
	{
		let s = 0.5 / Math.sqrt( trace );

		return new m3d.Quat(
			0.25 / s,
			(m.m[7] - m.m[5]) * s,
			(m.m[2] - m.m[6]) * s,
			(m.m[3] - m.m[1]) * s
		);
	}
	else
	{
		let max_diagonal_elem = maxf( m.m[0], maxf( m.m[4], m.m[8] ) );

		if( Math.abs(m.m[0] - max_diagonal_elem) < Number.EPSILON )
		{
			let s = Math.sqrt( 1.0 + m.m[0] - m.m[4] - m.m[8] ) * 2.0;

			return new m3d.Quat(
				0.5 / s,
				(m.m[1] + m.m[3]) / s,
				(m.m[2] + m.m[6]) / s,
				(m.m[5] + m.m[7]) / s
			);
		}
		else if( Math.abs(m.m[4] - max_diagonal_elem) < Number.EPSILON )
		{
			let s = Math.sqrt( 1.0 + m.m[4] - m.m[0] - m.m[8] ) * 2.0;

			return new m3d.Quat(
				(m.m[1] + m.m[3]) / s,
				0.5 / s,
				(m.m[5] + m.m[7]) / s,
				(m.m[2] + m.m[6]) / s
			);
		}
		else
		{
			let s = Math.sqrt( 1.0 + m.m[8] - m.m[0] - m.m[4] ) * 2.0;

			return new m3d.Quat(
				(m.m[2] + m.m[6]) / s,
				(m.m[5] + m.m[7]) / s,
				0.5 / s,
				(m.m[1] + m.m[3]) / s
			);
		}
	}
};

m3d.Quat.fromMat4 = function( m ) {
	let trace = m.m[0] + m.m[5] + m.m[10] + 1; /* add the diagonal values */

	if( trace > 0.0 )
	{
		let s = 0.5 / Math.sqrt( trace );

		return new m3d.Quat(
			0.25 / s,
			(m.m[9] - m.m[6]) * s,
			(m.m[2] - m.m[8]) * s,
			(m.m[4] - m.m[1]) * s
		);
	}
	else
	{
		let max_diagonal_elem = maxf( m.m[0], maxf( m.m[5], m.m[10] ) );

		if( Math.abs(m.m[0] - max_diagonal_elem) < Number.EPSILON )
		{
			let s = Math.sqrt( 1.0 + m.m[0] - m.m[5] - m.m[10] ) * 2.0;

			return new m3d.Quat(
				0.5 / s,
				(m.m[1] + m.m[4]) / s,
				(m.m[2] + m.m[8]) / s,
				(m.m[6] + m.m[9]) / s
			);
		}
		else if( Math.abs(m.m[5] - max_diagonal_elem) < Number.EPSILON )
		{
			let s = Math.sqrt( 1.0 + m.m[5] - m.m[0] - m.m[10] ) * 2.0;

			return new m3d.Quat(
				(m.m[1] + m.m[4]) / s,
				0.5 / s,
				(m.m[6] + m.m[9]) / s,
				(m.m[2] + m.m[8]) / s
			);
		}
		else
		{
			let s = Math.sqrt( 1.0 + m.m[10] - m.m[0] - m.m[5] ) * 2.0;

			return new m3d.Quat(
				(m.m[2] + m.m[8]) / s,
				(m.m[6] + m.m[9]) / s,
				0.5 / s,
				(m.m[1] + m.m[4]) / s
			);
		}
	}
};

m3d.Quat.prototype = {
	magnitude: function() {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );
	},

	normalize: function() {
		let magnitude = this.magnitude( );
		if( magnitude > 0.0 ) {
			this.w /= magnitude;
			this.x /= magnitude;
			this.y /= magnitude;
			this.z /= magnitude;
		}
	},

	add: function( q ) {
		return new m3d.Quat(
			this.x + q.x,
			this.y + q.y,
			this.z + q.z,
			this.w + q.w
		);
	},

	multiply: function( q ) {
		return new m3d.Quat(
			this.w * q.x + this.x * q.w - this.y * q.z + this.z * q.y,
			this.w * q.y + this.x * q.z + this.y * q.w - this.z * q.x,
			this.w * q.z - this.x * q.y + this.y * q.x + this.z * q.w,
			this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
		);
	},

	scale: function( s ) {
		this.x *= s;;
		this.y *= s;
		this.z *= s;
		this.w *= s;
	},

	dotProduct: function( q ) { /* 1 := similiar rotations */
		return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
	},

	conjugate: function( q ) {
		return new m3d.Quat(
			-q.x,
			-q.y,
			-q.z,
			 q.w
		);
	},

	rotate: function( v ) {
		let q_v = m3d.Quat.fromVector( v );

		let q_inverse = this.conjugate( );
		let q_v_inverse = q_v.multiply( q_inverse );
		let q_result = q.multiply( q_v_inverse );

		return new Vec4( q_result.x, q_result.y, q_result.z, 0.0 );
	},

	toMat3: function( ) {
		return new m3d.Mat3(
			1-2*this.y*this.y-2*this.z*this.z,  2*this.x*this.y+2*this.w*this.z,   2*this.x*this.z-2*this.w*this.y,
			2*this.x*this.y-2*this.w*this.z,    1-2*this.x*this.x-2*this.z*this.z, 2*this.y*this.z+2*this.w*this.x,
			2*this.x*this.z+2*this.w*this.y,    2*this.y*this.z-2*this.w*this.x,   1-2*this.x*this.x-2*this.y*this.y
		);
	},

	toMat4: function( ) {
		return new m3d.Mat4(
			1-2*this.y*this.y-2*this.z*this.z,  2*this.x*this.y+2*this.w*this.z,   2*this.x*this.z-2*this.w*this.y,   0.0,
			2*this.x*this.y-2*this.w*this.z,    1-2*this.x*this.x-2*this.z*this.z, 2*this.y*this.z+2*this.w*this.x,   0.0,
			2*this.x*this.z+2*this.w*this.y,    2*this.y*this.z-2*this.w*this.x,   1-2*this.x*this.x-2*this.y*this.y, 0.0,
			0.0,                                0.0,                               0.0,                               1.0
		);
	},

	angle: function( ) {
		return Math.acos( this.w ) * 2.0;
	},

	extractAxisAndAngle: function( axis, angle ) {
		angle = Math.acos( this.w ) * 2.0;
		let sin_angle = Math.sin( 0.5 * angle );

		axis.x = this.x / sin_angle;
		axis.y = this.y / sin_angle;
		axis.z = this.z / sin_angle;

		if( axis instanceof Vec4 ) {
			axis.w = 0.0;
		}
	},
};

/*
 * Transformations
 */
m3d.transforms = {

	translate: function( t ) {
		return new m3d.Mat4(
			 1.0,  0.0,  0.0,  0.0,
			 0.0,  1.0,  0.0,  0.0,
			 0.0,  0.0,  1.0,  0.0,
			 t.x,  t.y,  t.z,  1.0
		);
	},

	rotateX: function( a ) {
		let s = Math.sin( a );
		let c = Math.cos( a );

		return new m3d.Mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0,   c,  -s, 0.0,
			0.0,   s,   c, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	},

	rotateY: function( a ) {
		let s = Math.sin( a );
		let c = Math.cos( a );

		return new m3d.Mat4(
			  c, 0.0,   s, 0.0,
			0.0, 1.0, 0.0, 0.0,
			 -s, 0.0,   c, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	},

	rotateZ: function( a ) {
		let s = Math.sin( a );
		let c = Math.cos( a );

		return new m3d.Mat4(
			  c,  -s, 0.0, 0.0,
			  s,   c, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	},

	rotateFromVectorToVector: function( s, t ) {
		let v = s.crossProduct( t );
		let e = s.dotProduct( t );
		let h = 1 / (1 + e);

		return new m3d.Mat4(
			  e + h * v.x * v.x,   h * v.x * v.y + v.z,   h * v.x * v.z - v.y,  0,
			h * v.x * v.y - v.z,     e + h * v.y * v.y,   h * v.y * v.z + v.x,  0,
			h * v.x * v.z + v.y,   h * v.y * v.z - v.x,     e + h * v.z * v.z,  0,
							  0,                     0,                     0,  1
		);
	},

	scale: function( s ) {
		if( s instanceof m3d.Vec3 || s instanceof m3d.Vec4 ) {
			return new m3d.Mat4(
				 s.x,  0.0,  0.0,  0.0,
				 0.0,  s.y,  0.0,  0.0,
				 0.0,  0.0,  s.z,  0.0,
				 0.0,  0.0,  0.0,  1.0
			);
		}
		else {
			return new m3d.Mat4(
				 s,    0.0,  0.0,  0.0,
				 0.0,    s,  0.0,  0.0,
				 0.0,  0.0,    s,  0.0,
				 0.0,  0.0,  0.0,  1.0
			);
		}
	},

	shear: function( s ) {
		return new m3d.Mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			  s, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	},

	/* Beware of gimbal lock when any angle is set to +/- HALF_PI */
	eulerTransform: function( h, p, r ) {
		let sin_h = Math.sin( h );
		let cos_h = Math.cos( h );
		let sin_p = Math.sin( p );
		let cos_p = Math.cos( p );
		let sin_r = Math.sin( r );
		let cos_r = Math.cos( r );

		return new m3d.Mat4(
			cos_r * cos_h - sin_r * sin_p * sin_h,   sin_r * cos_h + cos_r * sin_p * sin_h,   -cos_p * sin_h,   0,
								   -sin_r * cos_p,                           cos_r * cos_p,            sin_p,   0,
			cos_r * sin_h + sin_r * sin_p * cos_h,   sin_r * sin_h - cos_r * sin_p * cos_h,    cos_p * cos_h,   0,
												0,                                       0,                0,   1
		);
	},

	orientationMatrix4: function( f, l, u ) {
		if( f instanceof m3d.Mat3 ) {
			return new m3d.Mat4(
				f.m[ 0], f.m[ 1], f.m[ 2], 0,
				f.m[ 3], f.m[ 4], f.m[ 5], 0,
				f.m[ 6], f.m[ 7], f.m[ 8], 0,
				      0,       0,       0, 1
			);
		}
		else if( f instanceof m3d.Mat4 ) {
			return new m3d.Mat4(
				f.m[ 0], f.m[ 1], f.m[ 2], 0,
				f.m[ 4], f.m[ 5], f.m[ 6], 0,
				f.m[ 8], f.m[ 9], f.m[10], 0,
				      0,       0,       0, 1
			);
		}
		else {
			f.normalize();
			l.normalize();
			u.normalize();

			return new m3d.Mat4(
				l.x,   l.y,  l.z,  0.0,
				u.x,   u.y,  u.z,  0.0,
				f.x,   f.y,  f.z,  0.0, // TODO: Check if this should be negative forward vector
				0.0,   0.0,  0.0,  1.0
			);
		}
	},

	orientationMatrix3: function( f, l, u ) {
		if( f instanceof m3d.Mat4 ) {
			return new m3d.Mat3(
				f.m[ 0], f.m[ 1], f.m[ 2],
				f.m[ 4], f.m[ 5], f.m[ 6],
				f.m[ 8], f.m[ 9], f.m[10]
			);
		}
		else {
			f.normalize();
			l.normalize();
			u.normalize();

			return new m3d.Mat3(
				l.x,   l.y,  l.z,
				u.x,   u.y,  u.z,
				f.x,   f.y,  f.z // TODO: Check if this should be negative forward vector
			);
		}
	},

	changeHandedness: function() {
		// convert from our coordinate system (looking down X)
		// to OpenGL's coordinate system (looking down -Z)
		return new m3d.Mat4(
			 0, 0, -1, 0,
			-1, 0,  0, 0,
			 0, 1,  0, 0,
			 0, 0,  0, 1
		);
	},

	rigidBodyTransform: function( orientation, translation, scale = null ) {
        if( scale ) {
		    return translation.multiplyMatrix( orientation ).multiplyMatrix( scale );
        }
        else {
		    return translation.multiplyMatrix( orientation );
        }
	},

	lookAt: function( eye, target, up ) {
		let z = new m3d.Vec3( target.x - eye.x, target.y - eye.y, target.z - eye.z );
		z.normalize( );

		let x = z.crossProduct( up );
		x.normalize( );

		let y = x.crossProduct( z );
		y.normalize( );

		return new m3d.Mat4(
			   x.x,     x.y,     x.z,  0.0, /* x-axis */
			   y.x,     y.y,     y.z,  0.0, /* y-axis */
			  -z.x,    -z.y,    -z.z,  0.0, /* z-axis */
		    -eye.x,  -eye.y,  -eye.z,  1.0  /* translation */
		);
	},

};

/*
 * Projections
 */
m3d.transforms.projections = {
	orthographic: function( left, right, bottom, top, near, far ) {
		return new m3d.Mat4(
			2.0 / (right - left)          , 0.0                           ,  0.0                      , 0.0,
			0.0                           , 2.0 / (top - bottom)          ,  0.0                      , 0.0,
			0.0                           , 0.0                           , -2.0 / (far - near)       , 0.0,
			-(right + left)/(right - left), -(top + bottom)/(top - bottom), -(far + near)/(far - near), 1.0
		);
	},

	frustum: function( left, right, bottom, top, near, far ) {
		let A = 2.0 * near / (right - left);
		let B = (right + left) / (right - left);
		let C = 2.0 * near / (top - bottom);
		let D = (top + bottom) / (top - bottom);
		let E = -(far + near) / (far - near);
		let F = -(2.0 * far * near) / (far - near);

		return new m3d.Mat4(
			  A,  0.0,    B,  0.0,
			0.0,    C,    D,  0.0,
			0.0,  0.0,    E,    F,
			0.0,  0.0, -1.0,  0.0
		);
	},

	perspective: function( fov, aspect, near, far ) {
		let A = 1.0 / Math.tan(fov * 0.5);
		let B = -far / (far - near);
		let C = -(far * near)/ (far - near);

		return new m3d.Mat4(
			A/aspect,  0.0,  0.0,  0.0,
				 0.0,    A,  0.0,  0.0,
				 0.0,  0.0,    B, -1.0,
				 0.0,  0.0,    C,  0.0
		);
	},
};

m3d.tools = {

	normalFromTrianangle: function( v1, v2, v3 ) {
		let vec1 = new m3d.Vec3( v2.x - v1.x, v2.y - v1.y, v2.z - v1.z );
		let vec2 = new m3d.Vec3( v3.x - v1.x, v3.y - v1.y, v3.z - v1.z );
		let normal = vec1.crossProduct( vec2 );
		normal.normalize();
		return normal;
	},

	normalFromTriangles: function( points ) {
		/*
		 * Every vertex is generally shared among 6 triangles.  We calculate the
		 * normal of each triangle and average them together to calculate the
		 * normal at vertex 0.
		 *
		 *                             1--2--*
		 *  The numbers are the        |\ |\ |
		 *  vertices that are members  | \| \|
		 *  of the 6 triangles shared  6--0--3
		 *  by vertex 0.               |\ |\ |
		 *                             | \| \|
		 *                             *--5--4
		 *
		 * This function extends this idea to an arbitrary number of triangles.
		 */
		let number_of_triangles = points.length / 3;

		let normal = m3d.Vec3.ZERO;

		for( let i = 0; i < points.length; i += 3 )
		{
			let n = m3d.tools.normalFromTrianangle( points[ i + 0], points[ i + 1 ], points[ i + 2 ] );

			if( normal.dotProduct( n ) < 0.0 )
			{
				/* Vector n is in opposite direction to
				 * accumulated normal. This happens when the points
				 * winding is not consistent.
				 */
				n.negate();
			}

			normal = normal.add( n );
		}

		return normal.multiply( 1.0 / number_of_triangles );
	},

	/* Point in screen space to world space */
	pointUnproject: function( point, projection, model, viewport ) {
		/* Convert to normalized device coordinates */
		let normalized_device_coordinate = new m3d.Vec4( ((point.x * 2.0) / viewport[2]) - 1.0, ((point.y * 2.0) / viewport[3]) - 1.0, 0.0, 1.0 );

		let inv_projmodel = projection.multiplyMatrix( model );
		inv_projmodel.invert( );

		return inv_projmodel.multiplyVector( normalized_device_coordinate );
	},

	/* Point in world space to screen space */
	pointProject: function( point, projection, model, viewport ) {
		let projmodel = projection.multiplyMatrix( model );
		let pt = projmodel.multiplyMatrix( point );

		return new m3d.Vec2( ((1.0 + pt.x) * viewport[2]) / 2.0, ((1.0 + pt.y) * viewport[3]) / 2.0 );
	},
};

// Export module if executing in Node.js
if (typeof window === 'undefined') {
    module.exports = m3d;
}
