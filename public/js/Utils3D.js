import * as THREE from "three";

export function debugSphere(x=0, y=0, z=0, color='red') {
	if (typeof x != "number") {
		y = x.y
		z = x.z
		x = x.x
		color = y || color;
		console.log(x, y, z, color)
	}
	const geometry = new THREE.SphereGeometry( 5, 32, 32 );
	const material = new THREE.MeshBasicMaterial({color: color, transparent:true, opacity: 0.5});
	const DEBUG_SPHERE = new THREE.Mesh(geometry, material);
	DEBUG_SPHERE.position.set(x, y, z);
	return DEBUG_SPHERE;
}

export function rotateObject(object, degreeX=0, degreeY=0, degreeZ=0) {
	object.rotateX(THREE.MathUtils.degToRad(degreeX));
	object.rotateY(THREE.MathUtils.degToRad(degreeY));
	object.rotateZ(THREE.MathUtils.degToRad(degreeZ));
}

export function checkerboard(n=4, squareSize=25, y=0, w=0){
	const thickness = 2;
	const opacity = 0.5;
	const boardSize = n * squareSize;
	
	const getMat = (primary, flip) => {
		let mat = new THREE.MeshBasicMaterial({
			color: primary ? 0xccccfc : 0x444464, 
			transparent: true, 
			opacity: opacity, 
			side: flip ? THREE.BackSide : THREE.FrontSide
		});
		// Fixes issue with transparent board hiding transparent pieces
		// https://discourse.threejs.org/t/material-transparency-problem/3822
		mat.depthWrite = false;
		return mat;
	};
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

export function checkerboard4D(n, squareSize, deltaY, deltaW) {
	let board4D = new THREE.Group();
	for (let y = 0; y < n; y++) {
		for (let w = 0; w < n; w++) {
			let boardSize = n * squareSize;
			let board2D = checkerboard(n, squareSize, y, w);
			board2D.position.set(0, deltaY * y, -(boardSize + deltaW) * w);
			board4D.add(board2D);
		}
	}
	// Make Origin the center of the first square
	let distToEdge = squareSize * (n - 1) / 2;
	board4D.position.set(distToEdge, 0, -distToEdge);
	return board4D;
};