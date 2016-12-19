/*
 *  Author: Joe Marrero.  manvscode@gmail.com
 */
webgl.camera = function( gl, projection, orientation, position ) {

	//if( this instanceof webgl.camera ) {
		webgl.CoordinateFrame.call( this, orientation || webgl.math.matrix3.IDENTITY, position || webgl.math.vector3.ZERO );
		this.gl               = gl || null;
		this.projectionMatrix = projection || webgl.math.matrix4.IDENTITY;
		this.xangle           = 0.0;
		this.yangle           = 0.0;
	//}
	//else {
		//return new webgl.camera( gl, projection, orientation, position );
	//}
};

webgl.camera.prototype = webgl.CoordinateFrame.prototype;
webgl.camera.prototype.constructor = webgl.camera;
webgl.camera.prototype.parent = webgl.CoordinateFrame.prototype;

webgl.camera.prototype.projectionMatrix = function() {
	return this.projectionMatrix;
};

webgl.camera.prototype.normalMatrix = function() {
	var modelMatrix = this.modelMatrix();
	var normalMatrix = new webgl.math.matrix3(
		model.m[0], model.m[1], model.m[ 2],
		model.m[4], model.m[5], model.m[ 6],
		model.m[8], model.m[9], model.m[10]
	);
	normalMatrix.transpose();
	return normalMatrix;
};

webgl.camera.prototype.viewMatrix = function() {
	return this.projectionMatrix.multiply( this.modelMatrix() );
};

webgl.camera.prototype.forwardVector = function() {
	return this.parent.zAxis();
};

webgl.camera.prototype.upVector = function() {
	return this.parent.yAxis();
};

webgl.camera.prototype.leftVector = function() {
	return this.parent.xAxis();
};

webgl.camera.prototype.offsetOrientation = function( xangle, yangle ) {
	this.xangle += xangle;
	this.yangle += yangle;
	this.yangle = webgl.math.core.clamp( this.yangle, -webgl.math.HALF_PI, webgl.math.HALF_PI );
};

webgl.camera.prototype.offsetPosition = function( offset ) {
	this.setPosition( this.position().add( offset ) );
};

webgl.camera.prototype.moveForwards = function( a ) {
	var f = this.zAxis();
	f.normalize();
	f.scale( a );
	this.offsetPosition( f );
};

webgl.camera.prototype.moveSideways = function( a ) {
	var s = this.xAxis();
	s.normalize();
	s.scale( a );
	this.offsetPosition( s );
};

webgl.camera.prototype.update = function( delta ) {
	var xrotation = webgl.math.matrix4.fromAxisAngle( webgl.math.vector3.YUNIT, xangle );
	var yrotation = webgl.math.matrix4.fromAxisAngle( webgl.math.vector3.XUNIT, yangle );
	this.setOrientation( yrotation.multiply( xrotation ) );
};




webgl.camera.createPerspectiveCamera = function( gl, viewport_width, viewport_height, near, far, fov, position ) {
	var aspect     = viewport_width / viewport_height;
	var projection = webgl.math.projections.perspective( fov * webgl.math.core.RADIANS_PER_DEGREE, aspect, near || 1.0, far || 100.0 );
	return new webgl.camera( gl, projection, webgl.math.matrix3.IDENTITY, position );
};

webgl.camera.createOrthographicCamera = function( gl, left, right, bottom, top, near, far, position ) {
	var aspect     = viewport_width / viewport_height;
	var projection = webgl.math.projections.orthographic( left, right, bottom, top, near, far );
	return new webgl.camera( gl, projection, webgl.math.matrix3.IDENTITY, position );
};
