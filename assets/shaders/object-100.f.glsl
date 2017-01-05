#version 100

varying mediump vec2 f_tex_coord;
varying mediump vec3 f_normal;
varying mediump vec3 f_light_intensity;
varying mediump vec4 f_vertex_world;

uniform sampler2D u_texture;


vec4 FOG_COLOR = vec4( 0.01, 0.01, 0.02, 1.0 );

vec4 fog_linear( vec4 color, vec4 fogColor, float fogNear, float fogFar ) {
	#if 1
	float dist = length(f_vertex_world);
	#else
	float dist = abs(f_vertex_world.z);
	#endif

	float fogFactor = clamp( (fogFar - dist)/(fogFar - fogNear), 0.0, 1.0 );
	return mix( fogColor, color, fogFactor );
}

vec4 fog_exp( vec4 color, vec4 fogColor, float fogDensity ) {
	#if 1
	float dist = length(f_vertex_world);
	#else
	float dist = abs(f_vertex_world.z);
	#endif

	float fogFactor = clamp( 1.0 / exp(dist * fogDensity), 0.0, 1.0 );
	return mix( fogColor, color, fogFactor );
}


void main( ) {
    vec4 color = vec4( texture2D( u_texture, f_tex_coord ).rgb * f_light_intensity, 1.0);
	gl_FragColor = fog_exp( color, FOG_COLOR, 0.019 );
}
