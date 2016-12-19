#version 100
precision mediump float;

attribute vec3 a_vertex;
attribute vec3 a_normal;
attribute vec2 a_tex_coord;

varying vec2 f_tex_coord;
varying vec3 f_normal;
varying vec3 f_light_intensity;

uniform mat4 u_projection;
uniform mat4 u_model_view;
//uniform mat4 u_normal_matrix;

void main( ) {
	gl_Position       = u_projection * u_model_view * vec4( a_vertex, 1.0 );
	f_normal          = a_normal;
	f_tex_coord       = a_tex_coord;
	f_light_intensity = vec3(1,1,1);
}
