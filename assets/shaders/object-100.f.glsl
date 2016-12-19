#version 100

varying mediump vec2 f_tex_coord;
varying mediump vec3 f_normal;
varying mediump vec3 f_light_intensity;

//uniform sampler2D u_texture;

void main( ) {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	//gl_FragColor = texture2D( u_texture, f_tex_coord );
}
