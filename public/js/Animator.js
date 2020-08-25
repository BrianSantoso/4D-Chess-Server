import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import * as THREE from 'three';
//import { v4 as uuidv4 } from 'uuid';
// uuidv4(); '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
// https://www.npmjs.com/package/@datastructures-js/priority-queue

class Animator {
	constructor() {
		this._queue = new MinPriorityQueue();
		this._ongoing = new Map(); // Maps meshes to Set of ongoing animations
	}
	
	update() {
		let animationFrames = this._dequeue();
		animationFrames.forEach(queueItem => {
			let aFrame = queueItem.element;
			let animation = aFrame.animationGroup;
			let mesh = animation.mesh;
			let ongoingForThisMesh = this._ongoing.get(mesh);
			
			// Only execute frame if it is in an ongoing animation
			if (ongoingForThisMesh.has(animation)) {
				aFrame.execute();
			}
		});
	}
	
	_dequeue() {
		let items = [];
		
		let front = this._queue.front();
		if (!front) {
			return items;
		}
		let baseValue = front.priority;
		
		let current = front;
		while (current && current.priority === baseValue) {
			items.push(current)
			this._queue.dequeue();
			current = this._queue.front();
		}
		return items;
	}
	
	_enqueue(animation) {
		let front = this._queue.front();
		let baseValue = front ? front.priority : 1;
		
		animation.frames.forEach((aFrame, frameNumber) => {
			let time = baseValue + frameNumber;
			this._queue.enqueue(aFrame, time);
		});
		
		let ongoing = this._ongoing.get(animation.mesh);
		if (!ongoing) {
			this._ongoing.set(animation.mesh, new Set());
			ongoing = this._ongoing.get(animation.mesh);
		}
		if (animation.override) {
			// Override all ongoing animations for this mesh
			ongoing.clear();
		}
		
		// Add to list of ongoing animations for this mesh
		ongoing.add(animation);
		animation.promise.then(() => {
			ongoing.delete(animation);
		});
	}
	
	animate(animation) {
		this._enqueue(animation);
		return animation.promise;
	}
	
	isOccupied() {
		return !this._queue.isEmpty();
	}
}

class Animation {
	constructor(mesh, frames, override=false) {
		this.mesh = mesh; // the mesh this animation is acting on
		this.frames = frames.map(frame => new AnimationFrame(frame, this)); // functions to be called on animate
		this.override = override; // whether this animation should override another animation currently acting on the same mesh
		this.promise = Promise.all(this.frames.map(aFrame => aFrame.promise));
	}
	
//	combine(animation) {
//		if (this.mesh !== animation.mesh) {
//			throw new Error('Cannot combine animations with different target meshes');
//		}
//		
//		let combinedFrames = [];
//		let i = 0;
//		let j = 0;
//		while (i < this.frames.length && j < animation.frames.length) {
//			let newFrame = () => {
//				this.frames[i]();
//				animation.frames[i]();
//			}
//			combinedFrames.push(newFrame);
//			i++, j++;
//		}
//		
//		combinedFrames = combinedFrames.concat(this.frames.slice(i));
//		combinedFrames = combinedFrames.concat(animation.frames.slice(i));
//		
//		return new Animation(combinedFrames, this.override || animation.override);
//	}
}

class AnimationFrame {
	constructor(frame, animationGroup) {
//		this.frame = frame;
		this.promise = new Promise((resolve) => {
			this.frame = () => {
				frame();
				resolve();
			}
		});
		this.animationGroup = animationGroup;
	}
	
	execute() {
		// TODO: Perhaps rework such that calling execute will resolve promise?
		this.frame();
	}
}

Animation.LINEAR = x => x;

Animation.QUADRATIC = x => -((x - 1) * (x - 1)) + 1;

Animation.COS = x => -0.5 * Math.cos(Math.PI * x) + 0.5

Animation.translate = function(mode, mesh, startPos, endPos, numFrames) {
	let frames = [];
	let interval = endPos.clone().sub(startPos);
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let moveTo = startPos.clone().add(interval.clone().multiplyScalar(percent));
		let frame = () => {
			mesh.position.set(moveTo.x, moveTo.y, moveTo.z);
		}
		frames.push(frame);
	}
	return new Animation(mesh, frames);
}

Animation.scale = function(mode, mesh, startScale, endScale, numFrames) {
	let frames = [];
	let interval = endScale - startScale;
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let scaleTo = startScale + interval * percent;
		let frame = () => {
			mesh.scale.set(scaleTo, scaleTo, scaleTo);
		}
		frames.push(frame);
	}
	return new Animation(mesh, frames);
}

Animation.opacity = function(mode, mesh, startOpacity, endOpacity, numFrames) {
	// Mesh must have transparent: true
	let frames = [];
	let interval = endOpacity - startOpacity;
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let opacity = startOpacity + interval * percent;
		let frame = () => {
			mesh.material.opacity = opacity;
		}
//		let promise = new Promise((resolve) => {
//			frame = () => {
//				mesh.material.opacity = opacity;
//				resolve();
//			}
//		});
		frames.push(frame);
	}
	
	return new Animation(mesh, frames);
}

export default Animator;
export { Animation };