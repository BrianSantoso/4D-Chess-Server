import * as THREE from "three";
import TrackballControls from "./TrackballControls.js";
import { debugSphere } from "./Utils3D.js";

class SceneManager {
	
	constructor(rootElement) {
		this._rootElement = rootElement;
		
		this._scene = null;
		this._camera = null;
		this._renderer = null;
		this._rayCaster = null;
		this._controls = null;
		this._initScene();
		this._initControls();
		
		this._subscribers = {
			mouvemove: new Set(),
			mousedown: new Set(),
			mouseup: new Set()
		}
		
		this._initEventListeners();
	}
	
	remove(object) {
		this._scene.remove(object);
		// TODO: unsubscribe current game from mouse event handlers
	}
	
	add(object) {
		this._scene.add(object);
		// TODO: subscribe current game from mouse event handlers
	}
	
	subscribe(obj, event) {
		this._subscribers[event].add(obj);
	}
	
	unsubscribe(obj) {
		Object.keys(this._subscribers).forEach(key => {
			this._subscribers[key].delete(obj);
		});
	}
	
	_initScene() {
		this._scene = new THREE.Scene();
		this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9000); 
		this._camera.position.set(0, 0, 0);
		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._renderer.domElement.id = "three-canvas";
		this._rootElement.appendChild(this._renderer.domElement);

		this._renderer.setClearColor(0xf7f7f7);
		
		let ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
		this._scene.add(ambientLight);

		let lightPosition1 = new THREE.Vector3(70, 300, -50);
		let lightPosition2 = new THREE.Vector3(-70, 300, -50);
		let directionalLightIntensity = 0.4;
		let directionalLightColour = 0xFFFFFF;
		let shadowFrustum = 50;
		let shadowMapWidth = 1024;
		let shadowMapHeight = 1024;
		let directionalLight1 = new THREE.DirectionalLight(directionalLightColour, directionalLightIntensity);
		let directionalLight2 = new THREE.DirectionalLight(directionalLightColour, directionalLightIntensity);
		directionalLight1.position.set(lightPosition1);
		directionalLight1.position.copy(lightPosition1);
		directionalLight1.castShadow = true;
		directionalLight1.shadow.camera.right = shadowFrustum;
		directionalLight1.shadow.camera.left = -shadowFrustum;
		directionalLight1.shadow.camera.top = shadowFrustum;
		directionalLight1.shadow.camera.bottom = -shadowFrustum;
		directionalLight1.shadow.mapSize.width = shadowMapWidth;
		directionalLight1.shadow.mapSize.height = shadowMapHeight;
		this._scene.add(directionalLight1);
		
//		this._scene.add(debugSphere(0, 0, 0));
		
		console.log('SceneManager', this._scene);
		console.log('camera', this._camera)
	}
	
	onWindowResize() {
		this._camera.aspect = window.innerWidth / window.innerHeight;
		this._camera.updateProjectionMatrix();
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._controls.handleResize();
	}
	
	_initEventListeners() {
		window.addEventListener('resize', () => {
			this.onWindowResize();
			// TODO: detach event listener
		}, false);
		
		this._addEventListener('mousemove', (e) => { 
			this._updateRayCaster(this._mouseCoords(e));
		});
		this._addEventListener('mousedown', () => {});
		this._addEventListener('mouseup', () => {});
	}
	
	_addEventListener(event, f) {
		this._renderer.domElement.addEventListener(event, (e) => {
			e.preventDefault(); // TODO: this may be problematic
			f(e);
			e.rayCaster = this._rayCaster;
			this._subscribers[event].forEach(subscriber => {
//				subscriber.keyInputs();
			});
		}, false);
		if (!(event in this._subscribers)) {
			this._subscribers[event] = new Set();
		}
	}
	
	_mouseCoords(event) {
		let mouse = new THREE.Vector2();
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		return mouse;
	}
	
	_initControls() {
		let controls = new TrackballControls(this._camera, this._renderer.domElement);

		controls.rotateSpeed = 1.8; // set rotation/zoom/pan speeds
		controls.zoomSpeed = 1.5;
		controls.panSpeed = 0.45;

		controls.noZoom = false; // enable zooming, panning, and smooth panning
		controls.noPan = false;
		controls.staticMoving = false;

		controls.dynamicDampingFactor = 0.2; // set dampening factor
		controls.minDistance = 100;
		controls.maxDistance = 1400;
		
		controls.target.set(0, 0, -200);
		
		this._controls = controls;
		
		console.log('Controls', controls)
		
		this._rayCaster = new THREE.Raycaster();
	}
	
	_updateRayCaster(pos2D) {
		this._rayCaster.setFromCamera(pos2D, this._camera);
	}
	
	getRayCaster() {
		return this._rayCaster;
	}
	
	keyInputs() {
		this._controls.update();
	}
	
	draw() {
		this._renderer.render(this._scene, this._camera);
	}
}

export default SceneManager;