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
			
			// Remove from ongoing animations when finished
			if (aFrame.last) {
				ongoingForThisMesh.delete(animation);
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
	}
	
	animate(animation) {
		this._enqueue(animation);
	}
}

class Animation {
	constructor(mesh, frames, override=false) {
		this.mesh = mesh; // the mesh this animation is acting on
		this.frames = frames.map(frame => new AnimationFrame(frame, this)); // functions to be called on animate
		this.frames[this.frames.length - 1].last = true;
		this.override = override; // whether this animation should override another animation currently acting on the same mesh
	}
	
	combine(animation) {
		if (this.mesh !== animation.mesh) {
			throw new Error('Cannot combine animations with different target meshes');
		}
		
		let combinedFrames = [];
		let i = 0;
		let j = 0;
		while (i < this.frames.length && j < animation.frames.length) {
			let newFrame = () => {
				this.frames[i]();
				animation.frames[i]();
			}
			combinedFrames.push(newFrame);
			i++, j++;
		}
		
		combinedFrames = combinedFrames.concat(this.frames.slice(i));
		combinedFrames = combinedFrames.concat(animation.frames.slice(i));
		
		return new Animation(combinedFrames, this.override || animation.override);
	}
}

class AnimationFrame {
	constructor(frame, animationGroup, last=false) {
		this.frame = frame;
		this.animationGroup = animationGroup;
		this.last = last;
	}
	
	execute() {
		this.frame();
	}
}

Animator.LINEAR = x => x;

Animator.QUADRATIC = x => -((x - 1) * (x - 1)) + 1;

Animator.COS = x => -0.5 * Math.cos(Math.PI * x) + 0.5

Animator.translate = function(mode, mesh, startPos, endPos, numFrames, onFinishCallback) {
	let frames = [];
	let interval = endPos.clone().sub(startPos);
	onFinishCallback = onFinishCallback || function() {};
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let moveTo = startPos.clone().add(interval.clone().multiplyScalar(percent));
		let lastFrame = frame === numFrames;
		let frame = () => {
			mesh.position.set(moveTo.x, moveTo.y, moveTo.z);
			if (lastFrame) {
				onFinishCallback();
			}
		}
		frames.push(frame);
	}
	return new Animation(mesh, frames);
}

Animator.scale = function(mode, mesh, startScale, endScale, numFrames, onFinishCallback) {
	let frames = [];
	let interval = endScale - startScale;
	onFinishCallback = onFinishCallback || function() {};
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let scaleTo = startScale + interval * percent;
		let lastFrame = frame === numFrames;
		let frame = () => {
			mesh.scale.set(scaleTo, scaleTo, scaleTo);
			if (lastFrame) {
				onFinishCallback();
			}
		}
		frames.push(frame);
	}
	return new Animation(mesh, frames);
}

Animator.opacity = function(mode, mesh, startOpacity, endOpacity, numFrames, onFinishCallback) {
	// Mesh must have transparent: true
	let frames = [];
	let interval = endOpacity - startOpacity;
	onFinishCallback = onFinishCallback || function() {};
	for (let frame = 1; frame <= numFrames; frame++) {
		let percent = mode(frame / numFrames);
		let opacity = startOpacity + interval * percent;
		let lastFrame = frame === numFrames;
		let frame = () => {
			mesh.material.opacity = opacity;
			if (lastFrame) {
				onFinishCallback();
			}
		}
		frames.push(frame);
	}
	return new Animation(mesh, frames);
}

export default Animator;