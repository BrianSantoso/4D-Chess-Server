import * as THREE from 'three';

/*
 * Return a random integer in [lowerBound, upperBound]
 */
function getRandomInteger(lowerBound, upperBound){
	//          [0, 1)                range                     
	return Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);
}

/*
 * Utility function to rotate camera about a point by theta radians
 */
function rotateCameraAbout(camera, center, theta) {
	camera.position.sub(center);
	let x = camera.position.x,
		y = camera.position.y,
		z = camera.position.z;
	camera.position.x = x * Math.cos(theta) + z * Math.sin(theta);
	camera.position.z = z * Math.cos(theta) - x * Math.sin(theta);
	camera.position.add(center);
}

/*
 * Create a debug sphere and add it to the scene
 */
function DEBUG(pos, color=0xff0000, opacity=0.5) {
	const geometry = new THREE.SphereGeometry( 5, 32, 32 );
	const material = new THREE.MeshBasicMaterial({color: color, transparent:true, opacity: opacity});
	const DEBUG_SPHERE = new THREE.Mesh(geometry, material);
	DEBUG_SPHERE.position.set(pos.x, pos.y, pos.z);
	scene.add(DEBUG_SPHERE);
	return DEBUG_SPHERE;
}

function removeEntity(objectName, scene=scene) {
	var selectedObject = scene.getObjectByName(objectName.name);
	scene.remove(selectedObject);
}

function eq(a, b) {
	return _.reduce(a, function(result, value, key) {
		return _.isEqual(value, b[key]) ?
			result : result.concat(key);
	}, []);
}

/*
 * Compare two objects by reducing an array of keys in obj1, having the
 * keys in obj2 as the intial value of the result. Key points:
 *
 * - All keys of obj2 are initially in the result.
 *
 * - If the loop finds a key (from obj1, remember) not in obj2, it adds
 *   it to the result.
 *
 * - If the loop finds a key that are both in obj1 and obj2, it compares
 *   the value. If it's the same value, the key is removed from the result.
 */
function getObjectDiff(obj1, obj2) {
	const diff = Object.keys(obj1).reduce((result, key) => {
		if (!obj2.hasOwnProperty(key)) {
			result.push(key);
		} else if (_.isEqual(obj1[key], obj2[key])) {
			const resultKeyIndex = result.indexOf(key);
			result.splice(resultKeyIndex, 1);
		}
		return result;
	}, Object.keys(obj2));

	return diff;
}

var compare = function (a, b) {

  var result = {
	different: [],
	missing_from_first: [],
	missing_from_second: []
  };

  _.reduce(a, function (result, value, key) {
	if (b.hasOwnProperty(key)) {
	  if (_.isEqual(value, b[key])) {
		return result;
	  } else {
		if (typeof (a[key]) != typeof ({}) || typeof (b[key]) != typeof ({})) {
		  //dead end.
		  result.different.push(key);
		  return result;
		} else {
		  var deeper = compare(a[key], b[key]);
		  result.different = result.different.concat(_.map(deeper.different, (sub_path) => {
			return key + "." + sub_path;
		  }));

		  result.missing_from_second = result.missing_from_second.concat(_.map(deeper.missing_from_second, (sub_path) => {
			return key + "." + sub_path;
		  }));

		  result.missing_from_first = result.missing_from_first.concat(_.map(deeper.missing_from_first, (sub_path) => {
			return key + "." + sub_path;
		  }));
		  return result;
		}
	  }
	} else {
	  result.missing_from_second.push(key);
	  return result;
	}
  }, result);

  _.reduce(b, function (result, value, key) {
	if (a.hasOwnProperty(key)) {
	  return result;
	} else {
	  result.missing_from_first.push(key);
	  return result;
	}
  }, result);

  return result;
}

function genGameId() {
	return 'gxxxxxxx'.replace(/[x]/g, function(character) {
		const r = Math.random() * 16 | 0
		const v = character == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * Utility function to rotate mesh about the x, y, and z axes.
 */
export function rotateObject(object, degreeX=0, degreeY=0, degreeZ=0) {
	object.rotateX(THREE.MathUtils.degToRad(degreeX));
	object.rotateY(THREE.MathUtils.degToRad(degreeY));
	object.rotateZ(THREE.MathUtils.degToRad(degreeZ));
}