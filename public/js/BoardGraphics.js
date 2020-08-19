import * as THREE from "three";
import Animator from "./Animator.js";

class BoardGraphics {
	constructor(n) {
		this.n = n;
		this._container = new THREE.Group();
		this._animator = new Animator();
		
		this._init();
	}
	
	update() {
		
	}
	
	view3D() {
		return this._container;
	}
	
	_init() {
		let square = 25;
		this._container.add(BoardGraphics.checkerboard4D(this.n, square, square * 3, square * 1.5));
		
		console.log('BoardGraphics', this._container);
	}
}

BoardGraphics.checkerboard = function(n=4, squareSize=25, y=0, w=0){
	
	const rotateObject = (object, degreeX=0, degreeY=0, degreeZ=0) => {
		object.rotateX(THREE.MathUtils.degToRad(degreeX));
		object.rotateY(THREE.MathUtils.degToRad(degreeY));
		object.rotateZ(THREE.MathUtils.degToRad(degreeZ));
	}
	const thickness = 2;
	const opacity = 0.5;
	const boardSize = n * squareSize;
	
	const getMat = (primary, flip) => new THREE.MeshBasicMaterial({
		color: primary ? 0xccccfc : 0x444464, 
		transparent: true, 
		opacity: opacity, 
		side: flip ? THREE.BackSide : THREE.FrontSide
	});
	const getMatArr = (flip) => [getMat(true, flip), getMat(false, flip)];
	
	let topGeometry = new THREE.PlaneGeometry(boardSize, boardSize, n, n);
	let bottomGeometry = new THREE.PlaneGeometry(boardSize, boardSize, n, n);
	let sideGeometry = new THREE.PlaneGeometry(thickness, boardSize, 1, n);
	
	let materialsTop = getMatArr(false);
	let materialsBottom = getMatArr(true);
	let materialsSide = getMatArr(false);
	
	for(let x = 0; x < n; x++){
      for(let z = 0; z < n; z++){
          let i = x * n + z;
          let j = i * 2;
		  topGeometry.faces[j].materialIndex = topGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  bottomGeometry.faces[j].materialIndex = bottomGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  
		  let k = x;
		  let l = k * 2;
		  sideGeometry.faces[l].materialIndex = sideGeometry.faces[l + 1].materialIndex = (x + y + z + w) % 2;
      }
    }
	
	let topMesh = new THREE.Mesh(topGeometry, materialsTop);
	let bottomMesh = new THREE.Mesh(bottomGeometry, materialsBottom);
	let sideMesh1 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh2 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh3 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh4 = new THREE.Mesh(sideGeometry, materialsSide);
	
	rotateObject(sideMesh1, 0, 90, 0); //front
	rotateObject(sideMesh2, 90, 0, 90); //left
	rotateObject(sideMesh3, 180, -90, 0); //back
	rotateObject(sideMesh4, -90, 0, -90); //right
	
	bottomMesh.position.set(0, 0, -thickness);
	sideMesh1.position.set(boardSize / 2, 0, -thickness / 2);
	sideMesh2.position.set(0, -boardSize / 2, -thickness / 2);
	sideMesh3.position.set(-boardSize / 2, 0, -thickness / 2);
	sideMesh4.position.set(0, boardSize / 2, -thickness / 2);
	
	let boxContainer = new THREE.Group();
	boxContainer.add(topMesh);
	boxContainer.add(bottomMesh);
	boxContainer.add(sideMesh1);
	boxContainer.add(sideMesh2);
	boxContainer.add(sideMesh3);
	boxContainer.add(sideMesh4);
	
	rotateObject(boxContainer, -90, 0, 0)
	return boxContainer;
}

BoardGraphics.checkerboard4D = function(n, squareSize, deltaY, deltaW) {
	let board4D = new THREE.Group();
	for (let y = 0; y < 4; y++) {
		for (let w = 0; w < 4; w++) {
			let boardSize = n * squareSize;
			let board2D = BoardGraphics.checkerboard(n, squareSize, y, w);
			board2D.position.set(0, deltaY * y, -(boardSize + deltaW) * w);
			board4D.add(board2D);
		}
	}
	return board4D;
};

export default BoardGraphics;