import { rotateCameraAbout } from "./Utils.js";

function ClientState(keyInputs, update, render) {
	this.keyInputs = keyInputs;
	this.update = update;
	this.render = render;
}

// Render the simulation
function render(scene, camera, renderer, animationQueue) {
	if(animationQueue.length > 0){
		animationQueue[0].onAnimate()
		animationQueue[0].execute()
		animationQueue.shift()
	}
//	console.log(scene, camera)
	renderer.render(scene, camera);
}

function fixControlsTargetToBox() {
	const BB = gameBoard.graphics.getBoundingBox();
	const T = controls.target;
	if(T.x < BB.bottomLeft.x) {
		T.x = BB.bottomLeft.x;
	}
	if(T.x > BB.topRight.x) {
		T.x = BB.topRight.x;
	}
	
	if(T.y < BB.bottomLeft.y) {
		T.y = BB.bottomLeft.y;
	}
	if(T.y > BB.topRight.y) {
		T.y = BB.topRight.y;
	}
	
	if(T.z > BB.bottomLeft.z) {
		T.z = BB.bottomLeft.z;
	}
	if(T.z < BB.topRight.z) {
		T.z = BB.topRight.z;
	}
}

ClientState.GAME_STATE = new ClientState(
	// update mouse controls
	function keyInputs(step, controls, pointer, camera) {
		pointer.clicks = true;
		controls.noPan = false;
		controls.update();
		fixControlsTargetToBox()
		if (debugSphere) {
			//		debugSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
		}
		pointer.keyInputs();
	},

	// update the simulation
	function update() {
		
		

	},
	render
);

ClientState.PAUSE = new ClientState(
	function keyInputs(step, controls, pointer, camera) {},
	function update() {},
	function render() {}
);

ClientState.MENU = new ClientState(
	(() => {
		let idleMenuRotateVel = 0.5;
		return function keyInputs(step, controls, pointer, camera) {
			controls.noPan = true;
			pointer.clicks = false;
			pointer.updateDragVector();
			const dragVector = pointer.dragVector;
			if (dragVector.x != 0) {
				const direction = dragVector.x / Math.abs(dragVector.x);
				idleMenuRotateVel = 0.5 * direction;
			}
			if (dragVector.x == 0 && dragVector.y == 0) {
				rotateCameraAbout(camera, controls.target, idleMenuRotateVel * step * -1)
			}
			controls.update();
		}
	})(),
	function update() {},
	render
);

ClientState.PLAY_OPTIONS = new ClientState(
	(() => {
		let idleMenuRotateVel = 0.5
		return function keyInputs(step, controls, pointer, camera) {
			controls.noPan = true;
			pointer.clicks = false;
			pointer.updateDragVector();
			const dragVector = pointer.dragVector;
			if (dragVector.x != 0) {
				const direction = dragVector.x / Math.abs(dragVector.x);
				idleMenuRotateVel = 0.5 * direction;
			}
			if (dragVector.x == 0 && dragVector.y == 0) {
				rotateCameraAbout(camera, controls.target, idleMenuRotateVel * step * -1)
			}
			controls.update();
		}
	})(),
	function update() {},
	render
);

ClientState.SERVER = new ClientState(
	function keyInputs(step, controls, pointer, camera) {},
	function update() {},
	function render() {}
);

export default ClientState;