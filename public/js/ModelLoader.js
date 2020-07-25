import Models from "./Models.js";
import * as THREE from "three";

export default ModelLoader = {
	loadModels: function(){
		return new Promise(function(resolve, reject) {
			// Loads all chess models then calls init when finished
			const manager = new THREE.LoadingManager();
			manager.onLoad = resolve // Initialize game when finished loading
			const loader = new THREE.ObjectLoader(manager);

			let index = 0;
			Models.pieceData.forEach(piece => {

				const path = Models.directory + piece.fileName
				loader.load(path, function(geometry, materials) {
					Models.geometries[piece.name] = geometry
				});

				Models.pieceIndices[piece.name] = index++
			});
		});
    }
}
