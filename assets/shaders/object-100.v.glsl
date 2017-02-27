#version 100
precision mediump float;

attribute vec3 a_vertex;
attribute vec3 a_normal;
attribute vec2 a_tex_coord;

varying vec2 f_tex_coord;
varying vec3 f_normal;
varying vec3 f_light_intensity;
varying vec4 f_vertex_world;
varying vec2 f_caustic_tex_coord;

uniform mat4 u_projection;
uniform mat4 u_model_view;
uniform mat3 u_normal_matrix;


const vec4 plane_s = vec4( 0.5 / 4.0, 0.1 / 10.0, 0.0, 0.0 );
const vec4 plane_t = vec4( 0.0, 0.1 / 10.0, 0.5 / 4.0, 0.0 );


void main( ) {
	f_vertex_world      = u_projection * u_model_view * vec4( a_vertex, 1.0 );
	gl_Position         = f_vertex_world;
	f_normal            = a_normal;
	f_tex_coord         = a_tex_coord;
	f_caustic_tex_coord = vec2(
		1.05 * dot( vec4(a_vertex,1.0), plane_s ),
		1.05 * dot( vec4(a_vertex,1.0), plane_t )
	);

    vec3 u_light_direction = normalize( vec3(0.2, 1, 0.3) );
    vec3 u_light_color = vec3(1.4, 1.4, 1.5);

    // Convert normal and position to eye coords
	vec3 tnorm = normalize( u_normal_matrix * f_normal );

	f_light_intensity = u_light_color * max( dot(u_light_direction, tnorm), 0.0 );
}
