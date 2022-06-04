#version 100
precision mediump float;

attribute vec2 a_vertex;
attribute vec3 a_color;

varying vec3 f_color;


void main( ) {
	gl_Position  = vec4( a_vertex.x, a_vertex.y, 0, 1.0 );
    f_color     = a_color;
}
