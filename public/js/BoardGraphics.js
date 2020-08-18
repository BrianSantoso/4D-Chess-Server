import * as THREE from "three";
import Animator from "./Animator.js";

class BoardGraphics {
	constructor() {
		this._container = new THREE.Group();
		this._animator = new Animator();
	}
}

export default BoardGraphics;