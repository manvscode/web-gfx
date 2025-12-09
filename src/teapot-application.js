import { GFX, Attribute, Uniform, Shader } from './lib/gfx.js';


class TeapotApplication {

	constructor(canvasId, attributes) {
		this.canvas = document.getElementById(canvasId);

		const gfxAttributes = attributes || {
			alpha: true,
			depth: true,
			stencil: false,
			antialias: true,
			premultipliedAlpha: false,
			preserveDrawingBuffer: false,
		};

		this.gfx = new GFX(canvas, gfxAttributes);
	}

	setup() {
    	this.gfx.printInfo();
		this.gfx.resize(true);

		const gl = this.gfx.getContext();

		gl.enable( gl.DEPTH_TEST );
		gl.clearDepth(1.0);          // Clear everything
		gl.depthFunc(gl.LEQUAL);     // Near things obscure far things

		gl.enable( gl.CULL_FACE );
		gl.cullFace( gl.BACK );
		gl.frontFace( gl.CCW );

		gl.enable( gl.BLEND );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		this.gfx.assertNoError();

		gl.clearColor( 0, 0, 0, 0 );

		this.shaders["objectShader"] = this.gfx.glslProgramObject(
				[ // shaders
					{ type: gl.VERTEX_SHADER, url: "assets/shaders/object-100.v.glsl" },
					{ type: gl.FRAGMENT_SHADER, url: "assets/shaders/object-100.f.glsl" },
				],
				[ // attributes
					{ name: Attribute.vertex, variable: "a_vertex" },
					{ name: Attribute.normal, variable: "a_normal" },
					{ name: Attribute.textureCoord, variable: "a_tex_coord" },
				],
				[ // uniforms
					{ name: "useTexture", variable: "u_use_texture" },
					{ name: Uniform.color, variable: "u_color" },
					{ name: Uniform.projectionMatrix, variable: "u_projection" },
					{ name: Uniform.modelView, variable: "u_model_view" },
					{ name: Uniform.normalMatrix, variable: "u_normal_matrix" },
					{ name: Uniform.texture0, variable: "u_texture" },
					{ name: Uniform.texture1, variable: "u_caustic" },
					{ name: "lightDirection", variable: "u_light_direction" },
					{ name: "lightColor", variable: "u_light_color" },
				]
		);

	}

	render() {
		const gl = this.gfx.getContext();
		const now = this.gfx.now();
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
	}
}
