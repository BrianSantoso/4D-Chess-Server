import React, { Component } from 'react';
import SceneManager from '../SceneManager.js';
import { checkerboard, rotateObject } from '../Utils3D.js';
import * as THREE from 'three';
import random from 'random';

class Particles extends Component {
    constructor(props) {
        super(props);
        this._canvasWrapper = React.createRef();
        // TODO: use full-fledged client game manager, but with composition, to remove actual ChessGame?
        this._particles = new SceneManager();
    }

    componentDidMount() {
        this._particles.mount(this._canvasWrapper, false);
        this._initParticles(50);
        this._startLoop();
    }

    render() {
        return (
            <div className='greetingCanvasWrapper' ref={(ref) => (this._canvasWrapper = ref)}>
            </div>
        );
    }

    _randomize(particle) {
        let pitch = random.int(0, 360); // I don't actually know which axis is which
        let yaw = random.int(0, 360);
        let roll = random.int(0, 360);
        let x = random.int(-400, 400);
        let y = random.int(-200, 200);
        let z = random.int(0, -400);
        let x2 = random.int(-40, 40);
        let y2 = random.int(-20, 20);
        let z2 = random.int(0, -40);
        particle.position.set(x, y, z)

        let c = () => random.float(-1, 1);
        // let vel = new THREE.Vector3();
        // vel.set(c(), c(), c());
        let vel = new THREE.Vector3(x2, y2, z2).sub(particle.position);
        vel.normalize();
        let angularVel = new THREE.Vector3();
        angularVel.set(c(), c(), c());
        
        particle.velocity = vel;
        particle.angularVelocity = angularVel;
        rotateObject(particle, pitch, yaw, roll);
    }

    _initParticles(numParticles) {
        this._checkerboards = new THREE.Group();
        for (let i = 0; i < numParticles; i++) {
            let squareSize = 25;
            let color = i % 2;
            let particle = checkerboard([1, 1, 1, 1], squareSize, color);
            this._randomize(particle);
            this._checkerboards.add(particle);
        }
        this._checkerboards.position.set(0, -1, -100);
        this._particles.add(this._checkerboards);
        this._particles.draw();
        console.log('Particles:', this._particles);
    }

    _startLoop() {
		let last = 0;
		let now = window.performance.now();
		let dt;
		let accumulation = 0;
		const step = 1/60; // update simulation every 1/60 of a second (60 fps)
		
		let frame = () => {
			now = window.performance.now(); // store the time when the new frame starts
			dt = now - last; // calculate the amount of time the last frame took
			accumulation += Math.min(1, dt/1000);	// increase accumulation by the amount of time the last frame took and limit accumulation time to 1 second.

			// KEY INPUTS
			this._keyInputs();

			// if the accumulated time is larger than the fixed time-step, continue to
			// update the simulation until it is caught up to real time
			while(accumulation >= step){
				// UPDATE
				this._update(step);
				accumulation -= step;
			}
			
			// DRAW
			this._draw();

			last = now;
			requestAnimationFrame(frame); // repeat the loop
		}
		requestAnimationFrame(frame);
    }
    
    _keyInputs() {

    }

    _update() {
        const zero = new THREE.Vector3(0, 0, 0);
        this._checkerboards.children.forEach(particle => {
            let distance = particle.position.distanceTo(zero);
            if (distance > 800) {
                this._randomize(particle);
            }
            particle.position.add(particle.velocity);
            let av = particle.angularVelocity;
            rotateObject(particle, av.x, av.y, av.z);
        });
    }

    _draw() {
        this._particles.draw();
    }
}

export default Particles;