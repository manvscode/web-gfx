#version 100
precision mediump float;

varying vec2 f_tex_coord;
varying vec3 f_normal;
varying vec3 f_light_intensity;
varying vec4 f_vertex_world;
varying vec2 f_caustic_tex_coord;

uniform bool u_use_texture;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_caustic;


vec4 FOG_COLOR = vec4( 0.01, 0.01, 0.013, 1.0 );

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
	vec4 color;

	if( u_use_texture ) {
		vec4 texel0 = texture2D( u_texture, f_tex_coord );
		vec4 texel1 = texture2D( u_caustic, f_caustic_tex_coord );

		//vec4 finalTexel = mix( texel0, texel1, texel0.a );
		vec4 finalTexel = normalize(u_color * texel0 * texel1);
    	color = vec4( finalTexel.rgb * f_light_intensity, 1.0);
		gl_FragColor = fog_exp( color, FOG_COLOR, 0.013 );
	}
	else {
#if 0
    	gl_FragColor = vec4( u_color.rgb * f_light_intensity, u_color.a);
#else

		vec4 texel1 = texture2D( u_caustic, f_caustic_tex_coord );

		vec4 finalTexel = mix( u_color, texel1, u_color.a );
    	color = vec4( finalTexel.rgb * f_light_intensity, u_color.a);
		gl_FragColor = color;
#endif
	}

}
