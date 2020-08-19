import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

const Models = {
    SCALE_FACTOR: 9,
	
	directory: "../models/",
	
    pieceData: [
        {
            name: 'pawn',
            fileName: 'Pawn.model.glb',
            rotation: new THREE.Vector3(0, 0, 0)
        }, {
            name: 'rook',
            fileName: 'Rook.model.glb',
            rotation: new THREE.Vector3(0, -90, 0)
        }, {
            name: 'bishop',
            fileName: 'Bishop.model.glb',
            rotation: new THREE.Vector3(0, -90, 0)
        }, {
            name: 'knight',
            fileName: 'Knight.model.glb',
            rotation: new THREE.Vector3(0, 90, 0)
        }, {
            name: 'queen',
            fileName: 'Queen.model.glb',
            rotation: new THREE.Vector3(0, 0, 0)
        }, {
            name: 'king',
            fileName: 'King.model.glb',
            rotation: new THREE.Vector3(0, 0, 0)
        }
    ],
	
	    materials: {
        black: {
            color: 0x818181,
            reflectivity: 0.1,
            shininess: 20,
            shading: THREE.SmoothShading,
            transparent: false,
            opacity: 1.0
        },
    
        white: {
            color: 0xFCF6E3,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: false,
            opacity: 1.0

        },
    
        red: {
            color: 0xFF0000,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.6,
        },
        
        green: {
            color: 0x90EE90,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.6,
        },
        
        darkGreen: {
            color: 0x006400,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.6,
        },
		
		lightGreen: {
            color: 0x42f5aa,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.6,
        },
        
        orange: {
            color: 0xFFA500,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.4,
        },
        
        blue: {
            color: 0x00B9FF,
            reflectivity: 10,
            shininess: 25,
            shading: THREE.SmoothShading,
            transparent: true,
            opacity: 0.4,
        },
    },
    
    createMesh: function(piece, material, x=0, y=0, z=0, scale=1, canRayCast=true){
        const pieceData = Models.pieceData[Models.pieceIndices[piece]]
        const geometry = Models.geometries[piece]
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(material))
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(pieceData.rotation.x, pieceData.rotation.y, pieceData.rotation.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

		mesh.scale.set(Models.SCALE_FACTOR, Models.SCALE_FACTOR, Models.SCALE_FACTOR)
		
		mesh.scale.multiplyScalar(scale)
		mesh.position.set(x, y, z)
		
        mesh.canRayCast = canRayCast;
        
        return mesh  
    },
    
    geometries: {},
    pieceIndices: {},
  	loadModels: function() {
		// https://threejs.org/docs/#examples/en/loaders/GLTFLoader
		return new Promise(function(resolve, reject) {
			const manager = new THREE.LoadingManager();
			manager.onLoad = resolve;
			const loader = new GLTFLoader(manager);

			let index = 0;
			Models.pieceData.forEach(piece => {

				const path = Models.directory + piece.fileName
				loader.load(path, function(gltf) {
					Models.geometries[piece.name] = gltf.scene.children[0].geometry;
				});

				Models.pieceIndices[piece.name] = index++
			});
		});
    }
    
}

export default Models;