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