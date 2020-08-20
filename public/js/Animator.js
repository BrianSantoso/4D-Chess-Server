import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import * as THREE from 'three';
// https://www.npmjs.com/package/@datastructures-js/priority-queue

class Animator {
	constructor() {
		this._queue = new MinPriorityQueue();
	}
	
	update() {
		let frames = this._dequeue();
		frames.forEach(frame => {
			frame();
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
			items.push(current.element);
			this._queue.dequeue();
			current = this._queue.front();
		}
		return items;
	}
	
	_enqueue(frames) {
		let front = this._queue.front();
		let baseValue = front ? front.priority : 1;
		console.log(frames)
		frames.forEach((frame, frameNumber) => {
			let time = baseValue + frameNumber;
			this._queue.enqueue(frame, time);
		});
	}
}

Animator.linearInterpolate = function(mesh, startPos, endPos, numFrames, onFinish) {
	let frames = [];
	let scalar = 1 / numFrames;
	let step = endPos.clone().sub(startPos).multiplyScalar(scalar);
	let pos = startPos.clone();
	for (let i = 1; i <= numFrames; i++) {
		pos.add(step);
		let moveTo = pos.clone();
		let lastFrame = i === numFrames;
		let frame = () => {
			mesh.position.set(moveTo.x, moveTo.y, moveTo.z);
			if (lastFrame) {
				onFinish();
			}
		}
		frames.push(frame);
	}
	console.log('start, end', startPos, pos)
	return frames;
	
	/*
	let positions = []
    let scalar = 1/segments
    let interval = b.clone().sub(a)
	
    if (inclusivity[0]) {
		positions.push(a)
	}
	
    for(let i = 1; i < segments + +inclusivity[1]; i++){
        positions.push(a.clone().add(interval.clone().multiplyScalar(scalar * i)))  
    }
    
    return positions
	*/
	
}

export default Animator;