export default function ClientStateManager(state) {
	this.state = state;
	this.swapState = function(newState) {
		this.state = newState;
	}
	this.keyInputs = function(step, controls, pointer, camera) {
		this.state.keyInputs(step, controls, pointer, camera);
	}
	this.update = function() {
		this.state.update();
	}
	this.render = function(scene, camera, renderer, animationQueue) {
		this.state.render(scene, camera, renderer, animationQueue);
	}
}