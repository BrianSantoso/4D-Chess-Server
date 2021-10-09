"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const THREE = tslib_1.__importStar(require("three"));
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
//import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
const TrackballControls_js_1 = tslib_1.__importDefault(require("./TrackballControls.js"));
const Animator_js_1 = tslib_1.__importStar(require("./Animator.js"));
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
class SceneManager {
    constructor() {
        this._root;
        this._scene = null;
        this._camera = null;
        this._renderer = null;
        this._rayCaster = new THREE.Raycaster();
        ;
        this._controls = null;
        this._animator = new Animator_js_1.default();
        this._subscribers = {};
    }
    getCamera() {
        return this._camera;
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
    mount(root, useControls = true) {
        this._root = root;
        this._initScene();
        if (useControls) {
            this._initControls();
        }
        this._initEventListeners();
        this._root.appendChild(this._renderer.domElement);
    }
    _initScene() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, this._root.clientWidth / this._root.clientHeight, 0.1, 9000);
        this._camera.position.set(0, 0, 0);
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(this._root.clientWidth, this._root.clientHeight);
        // this._renderer.domElement.id = "three-canvas";
        // this._renderer.domElement.classList += " ";
        this._renderer.setClearColor(0xf7f7f7);
        // Somehow this fixes opacity issues
        // https://github.com/mrdoob/three.js/issues/3490
        this._renderer.sortObjects = false;
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
        console.log('camera', this._camera);
    }
    onContainerResize() {
        this._camera.aspect = this._root.clientWidth / this._root.clientHeight;
        this._camera.updateProjectionMatrix();
        if (this._controls2) {
            this._controls2.handleResize();
        }
        this._renderer.setSize(this._root.clientWidth, this._root.clientHeight);
        this.draw(); // Need to draw immediately after resize to prevent flickering
    }
    _initEventListeners() {
        // this._root.addEventListener('resize', () => {
        // 	// TODO: should not be window's resize event, but instead this._root's resize event
        // 	this.onWindowResize();
        // 	// TODO: detach event listener
        // }, false);
        const resizeObserver = new ResizeObserver(entries => {
            console.log('Resizing');
            this.onContainerResize();
        });
        resizeObserver.observe(this._root);
        const notAClick = 0.05;
        let dragStart = new THREE.Vector2(Infinity, Infinity); // TODO: Should be infinity vector
        this._addEventListener('mousemove', (e) => {
            this._updateRayCaster(this._mouseCoords(e));
        });
        this._addEventListener('mousedown', (e) => {
            dragStart = this._mouseCoords(e);
        });
        this._addEventListener('mouseup', (e) => {
            let dragEnd = this._mouseCoords(e);
            if (dragStart.distanceToSquared(dragEnd) < notAClick * notAClick) {
                this._renderer.domElement.dispatchEvent(customEvent);
            }
        });
        const customEvent = new Event('intentionalClick');
        this._addEventListener('intentionalClick', (e) => { });
    }
    // TODO: Move event listeners to view2d
    _addEventListener(event, f) {
        // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
        this._renderer.domElement.addEventListener(event, (e) => {
            // TODO: May need to check if e.target is renderer's dom element
            e.preventDefault(); // TODO: this may be problematic
            f(e);
            e.rayCaster = this._rayCaster;
            this._subscribers[event].forEach(subscriber => {
                subscriber[event](e);
            });
        }, false);
        if (!(event in this._subscribers)) {
            this._subscribers[event] = new Set();
        }
        // No need to worry about duplicate event listeners
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Multiple_identical_event_listeners	
    }
    _mouseCoords(event) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        let rect = event.target.getBoundingClientRect();
        let x = event.clientX - rect.left; //x position within the element.
        let y = event.clientY - rect.top; //y position within the element.
        let mouse = new THREE.Vector2();
        mouse.x = (x / this._root.clientWidth) * 2 - 1;
        mouse.y = -(y / this._root.clientHeight) * 2 + 1;
        return mouse;
    }
    _initControls() {
        // Camera's position will get reassigned.
        this._camera.position.set(387, 292, -244);
        const minDistance = 100;
        const maxDistance = Infinity;
        // https://threejs.org/docs/#examples/en/controls/OrbitControls
        this._controls = new OrbitControls_1.OrbitControls(this._camera, this._renderer.domElement);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.1;
        this._controls.screenSpacePanning = true;
        this._controls.enableZoom = false;
        this._controls.rotateSpeed = 0.3;
        this._controls.minDistance = minDistance;
        this._controls.maxDistance = maxDistance;
        this._controls2 = new TrackballControls_js_1.default(this._camera, this._renderer.domElement);
        this._controls2.noRotate = true;
        this._controls2.noPan = true;
        this._controls2.noZoom = false;
        this._controls2.zoomSpeed = 1.5;
        this._controls2.minDistance = minDistance;
        this._controls2.maxDistance = maxDistance;
    }
    _updateRayCaster(pos2D) {
        this._rayCaster.setFromCamera(pos2D, this._camera);
    }
    getRayCaster() {
        return this._rayCaster;
    }
    keyInputs() {
        this._syncControls();
    }
    update() {
        this._animator.update();
    }
    _syncControls() {
        if (this._controls && this._controls2) {
            this._controls.update();
            let target = this._controls.target;
            this._controls2.target.set(target.x, target.y, target.z);
            this._controls2.update();
        }
    }
    draw() {
        this._renderer.render(this._scene, this._camera);
    }
    configureCamera(boardGraphics, team, numFrames = 0) {
        team = team === ChessTeam_js_1.default.WHITE ? 1 : -1;
        let center = boardGraphics.getCenter();
        let offset = new THREE.Vector3(team * 320, 115, 0);
        let home = center.clone().add(offset);
        if (numFrames === 0) {
            this._camera.position.set(home.x, home.y, home.z);
            this._controls.target.set(center.x, center.y, center.z);
            this._syncControls();
        }
        else {
            this._controls.target.set(center.x, center.y, center.z);
            this._syncControls();
            let animation = Animator_js_1.Animation.translate(Animator_js_1.Animation.LINEAR, this._camera, this._camera.position.clone(), home.clone(), 60);
            this._animator.animate(animation);
        }
    }
}
exports.default = SceneManager;
//# sourceMappingURL=SceneManager.js.map