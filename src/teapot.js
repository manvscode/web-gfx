import { GFX, Uniform } from './lib/gfx.js';
import { Renderable } from './renderable.js';
import { TeapotModel } from '../assets/models/teapot.js';


class Teapot extends Renderable {

	constructor() {
		super();
		super(gfx);
        let gl = this.gfx.getContext();

        this.vboTeapot           = this.gfx.bufferCreate( new Float32Array(TeapotModel.vertices), gl.ARRAY_BUFFER, gl.STATIC_DRAW );
        this.vboTeapot.itemSize  = 8;
        this.vboTeapot.itemCount = TeapotModel.vertices.length / 8;
	}

	render(shader) {
	}

	update(delta) {
	}
}
