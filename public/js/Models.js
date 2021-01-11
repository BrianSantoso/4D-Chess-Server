import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

const Models = {
	SCALE_FACTOR: 5,
	directory: "../assets/models/",
	modelData: {
		Pawn: {
			fileName: 'Pawn.model.glb',
			rotation: new THREE.Vector3(0, 0, 0),
			geometry: null
		},
		Rook: {
			fileName: 'Rook.model.glb',
			rotation: new THREE.Vector3(0, -90, 0),
			geometry: null
		},
		Bishop: {
			fileName: 'Bishop.model.glb',
			rotation: new THREE.Vector3(0, -90, 0),
			geometry: null
		},
		Knight: {
			fileName: 'Knight.model.glb',
			rotation: new THREE.Vector3(0, 90, 0),
			geometry: null
		},
		Queen: {
			fileName: 'Queen.model.glb',
			rotation: new THREE.Vector3(0, 0, 0),
			geometry: null	
		},
		King: {
			fileName: 'King.model.glb',
			rotation: new THREE.Vector3(0, 0, 0),
			geometry: null
		}
	},

	materials: {
		black: {
			color: 0x818181,
			reflectivity: 0.1,
			shininess: 20,
			flatShading: THREE.SmoothShading,
			transparent: false,
			opacity: 1.0
		},

		white: {
			color: 0xFCF6E3,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: false,
			opacity: 1.0
		},
		
		darkGray: {
			color: 0x818181,
			reflectivity: 0.1,
			shininess: 20,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.35
		},
		
		lightGray: {
			color: 0xFCF6E3,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.35
		},

		red: {
			color: 0xFF0000,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.9,
		},

		green: {
			color: 0x90EE90,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.7,
		},

		darkGreen: {
			color: 0x006400,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.6,
		},

		lightGreen: {
			color: 0x42f5aa,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.6,
		},

		orange: {
			color: 0xFFA500,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.9,
		},

		blue: {
			color: 0x00B9FF,
			reflectivity: 10,
			shininess: 25,
			flatShading: THREE.SmoothShading,
			transparent: true,
			opacity: 0.9,
		},
	},

	createMesh: function(piece, material, pos, scale=1, opacity=1) {
		
		if (typeof material == "string") {
			material = Models.materials[material];
		}
		
		const modelData = Models.modelData[piece];
		const geometry = modelData.geometry;

		let newMaterial = new THREE.MeshPhongMaterial(material);
		newMaterial.originalColor = newMaterial.color.clone();
		if (opacity < 1) {
			// Specifying a material's opacity will override its default value.
			newMaterial.opacity = opacity;
			newMaterial.transparent = true;
		}
		newMaterial.originalOpacity = newMaterial.opacity;

		let mesh = new THREE.Mesh(geometry, newMaterial);
		
		mesh.position.set(0, 0, 0);
		mesh.rotation.set(modelData.rotation.x, modelData.rotation.y, modelData.rotation.z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.scale.set(Models.SCALE_FACTOR, Models.SCALE_FACTOR, Models.SCALE_FACTOR)
		mesh.scale.multiplyScalar(scale)
		mesh.position.set(pos.x, pos.y, pos.z)

		mesh.originalScale = mesh.scale.x;
//		mesh.canRayCast = canRayCast;

		return mesh
	},
	
	loadModels: function() {
		// https://threejs.org/docs/#examples/en/loaders/GLTFLoader
		return new Promise(function(resolve, reject) {
			const manager = new THREE.LoadingManager();
			manager.onLoad = resolve;
			const loader = new GLTFLoader(manager);
			
			// Iterate over modelData
			Object.keys(Models.modelData).forEach(key => {
				let modelData = Models.modelData[key];
				const path = Models.directory + modelData.fileName;
				loader.load(path, function(gltf) {
					modelData.geometry = gltf.scene.children[0].geometry;
				});
			});
		});
	}

}

export default Models;