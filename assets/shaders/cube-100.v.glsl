#version 100

attribute vec3 a_vertex;
attribute vec2 a_tex_coord;
attribute vec3 a_color;

varying vec2 f_tex_coord;
varying vec4 f_color;

uniform mat4 u_model_view;

void main( ) {
	gl_Position = u_model_view * vec4( a_vertex, 1.0 );
	f_tex_coord = a_tex_coord;
	f_color = vec4(a_color, 1);
}
