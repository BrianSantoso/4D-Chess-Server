import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import * as THREE from 'three';
//import { v4 as uuidv4 } from 'uuid';
// uuidv4(); '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
// https://www.npmjs.com/package/@datastructures-js/priority-queue

class Animator {
	constructor() {
		this._queue = new MinPriorityQueue();
		this._ongoing = new Map();
	}
	
	update() {
		let animationFrames = this._dequeue();
		animationFrames.forEach(aFrame => {
//			aFrame.execute();
			aFrame.element();
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
//			items.push(current.element);
			items.push(current)
			this._queue.dequeue();
			current = this._queue.front();
		}
		return items;
	}
	
	_enqueue(frames) {
		let front = this._queue.front();
		let baseValue = front ? front.priority : 1;
		
		frames.forEach((frame, frameNumber) => {
			let time = baseValue + frameNumber;
			this._queue.enqueue(frame, time);
		});
	}
	
	animate(frames) {
		this._enqueue(frames);
	}
}

class Animation {
	constructor(frames, override=false) {
		this.mesh; // the mesh this animation is acting on
		this.frames = frames.map(frame => new AnimationFrame(frame, this)); // functions to be called on animate
		this.override = override; // whether this animation should override another animation currently acting on the same mesh
	}
}

class AnimationFrame {
	constructor(frame, animationGroup) {
		this.frame = frame;
		this.animationGroup = animationGroup;
	}
	
	execute() {
		this.frame();
	}
}

Animator.LINEAR = x => x;

Animator.QUADRATIC = x => -((x - 1) * (x - 1)) + 1;

Animator.COS = x => -0.5 * Math.cos(Math.PI * x) + 0.5

Animator.translate = function(mode, mesh, startPos, endPos, numFrames, onFinishCallback) {
	let groupID = uuidv4();
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
	return frames;
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
	return frames;
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
	return frames;
}

export default Animator;