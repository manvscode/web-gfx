#version 100
varying mediump vec3 f_color;

void main( ) {
    gl_FragColor = vec4(f_color, 1);
}
