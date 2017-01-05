#version 100
precision mediump float;

attribute vec3 a_vertex;
attribute vec3 a_normal;
attribute vec2 a_tex_coord;

varying vec2 f_tex_coord;
varying vec3 f_normal;
varying vec3 f_light_intensity;
varying vec4 f_vertex_world;

uniform mat4 u_projection;
uniform mat4 u_model_view;
uniform mat3 u_normal_matrix;

void main( ) {
	f_vertex_world = u_projection * u_model_view * vec4( a_vertex, 1.0 );
	gl_Position    = f_vertex_world;
	f_normal       = a_normal;
	f_tex_coord    = a_tex_coord;

    vec3 u_light_direction = normalize( vec3(-0.25, 2, -0.3) );
    //vec3 u_light_color = vec3(0.7, 0.7, 0.7);
    vec3 u_light_color = vec3(1.0, 1.0, 1.0);

    // Convert normal and position to eye coords
	vec3 tnorm = normalize( u_normal_matrix * f_normal );
	vec3 light_direction_eye_space = normalize(u_normal_matrix * u_light_direction);

	f_light_intensity = u_light_color * max( dot(light_direction_eye_space, tnorm), 0.0 );
}
