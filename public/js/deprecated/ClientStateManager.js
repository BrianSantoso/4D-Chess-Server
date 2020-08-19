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
	
	this.gameLoop = function() {
		let last = 0;
		let now = window.performance.now();
		let dt;
		let accumulation = 0;
		const step = 1/60; // update simulation every 1/60 of a second (60 fps)
		
		function frame() {

			now = window.performance.now(); // store the time when the new frame starts
			dt = now - last; // calculate the amount of time the last frame took
			accumulation += Math.min(1, dt/1000);	// increase accumulation by the amount of time the last frame took and limit accumulation time to 1 second.

			this.keyInputs(step, controls, pointer, camera); // update mouse input

			// if the accumulated time is larger than the fixed time-step, continue to
			// update the simulation until it is caught up to real time
			while(accumulation >= step){
				this.update(); // update the simulation
				accumulation -= step;
			}
			// render the scene
			this.render(scene, camera, renderer, animationQueue);

			last = now;
			requestAnimationFrame(frame); // repeat the loop
		}
	}
}