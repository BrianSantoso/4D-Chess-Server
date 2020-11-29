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

export function checkerboard(dim, squareSize, y=0, w=0){
	const [_x, _y, _z, _w] = dim;
	const thickness = 2;
	const opacity = 0.5;
	const boardSizeX = _x * squareSize;
	const boardSizeZ = _z * squareSize;
	
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

	let materialsTop = getMatArr(false);
	let materialsBottom = getMatArr(true);
	let materialsSide = getMatArr(false);

	let topGeometry = new THREE.PlaneGeometry(boardSizeX, boardSizeZ, _x, _z);
	let bottomGeometry = new THREE.PlaneGeometry(boardSizeX, boardSizeZ, _x, _z);
	let sideGeometryX = new THREE.PlaneGeometry(thickness, boardSizeX, 1, _x);
	let sideGeometryZ = new THREE.PlaneGeometry(thickness, boardSizeZ, 1, _z);

	for(let x = 0; x < _x; x++){
      for(let z = 0; z < _z; z++){
          let i = z * _x + x;
		  let j = i * 2;
		  topGeometry.faces[j].materialIndex = topGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  bottomGeometry.faces[j].materialIndex = bottomGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;

		  let k = x * 2;
		  let l = z * 2;
		  sideGeometryX.faces[k].materialIndex = sideGeometryX.faces[k + 1].materialIndex = (x + y + z + w) % 2;
		  sideGeometryZ.faces[l].materialIndex = sideGeometryZ.faces[l + 1].materialIndex = (x + y + z + w) % 2;
      }
    }
	
	let topMesh = new THREE.Mesh(topGeometry, materialsTop);
	let bottomMesh = new THREE.Mesh(bottomGeometry, materialsBottom);
	let sideMesh1 = new THREE.Mesh(sideGeometryZ, materialsSide);
	let sideMesh2 = new THREE.Mesh(sideGeometryX, materialsSide);
	let sideMesh3 = new THREE.Mesh(sideGeometryZ, materialsSide);
	let sideMesh4 = new THREE.Mesh(sideGeometryX, materialsSide);
	
	rotateObject(sideMesh1, 0, 90, 0); //front
	rotateObject(sideMesh2, 90, 0, 90); //left
	rotateObject(sideMesh3, 180, -90, 0); //back
	rotateObject(sideMesh4, -90, 0, -90); //right
	
	bottomMesh.position.set(0, 0, -thickness);
	sideMesh1.position.set(boardSizeX / 2, 0, -thickness / 2);
	sideMesh2.position.set(0, -boardSizeZ / 2, -thickness / 2);
	sideMesh3.position.set(-boardSizeX / 2, 0, -thickness / 2);
	sideMesh4.position.set(0, boardSizeZ / 2, -thickness / 2);
	
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

export function checkerboard4D(dim, squareSize, deltaY, deltaW) {
	const [_x, _y, _z, _w] = dim;
	let board4D = new THREE.Group();
	for (let y = 0; y < _y; y++) {
		for (let w = 0; w < _w; w++) {
			let boardSizeZ = _z * squareSize;
			let board2D = checkerboard(dim, squareSize, y, w);
			board2D.position.set(0, deltaY * y, -(boardSizeZ + deltaW) * w);
			board4D.add(board2D);
		}
	}
	// Make Origin the center of the first square
	let distToEdgeX = squareSize * (_x - 1) / 2;
	let distToEdgeZ = squareSize * (_z - 1) / 2;
	board4D.position.set(distToEdgeX, 0, -distToEdgeZ);
	return board4D;
};