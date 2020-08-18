function BoardGraphics(gameBoard, scene, animationQueue) {
	this.gameBoard = gameBoard;
	this.scene = scene;
	this.animationQueue = animationQueue;
	this.n = gameBoard.n;
	this.squareSize = 50
	this.boardSize = this.squareSize * this.n;
    this.verticalIncrement = 100 * 1.75
    this.horizontalGap = this.squareSize * 1.6
    this.horizontalIncrement = this.n * this.squareSize + this.horizontalGap
    this.globalLength = this.horizontalIncrement * (this.n - 1)
    this.globalHeight = this.verticalIncrement * this.n
	this.boardHeight = 5;
    this.EPSILON = 1
	
	this.mesh = new THREE.Object3D();
	this.boardContainer = new THREE.Object3D();
    this.piecesContainer = new THREE.Object3D();
    this.possibleMovesContainer = new THREE.Object3D();
	this.boardContainer.name = 'boardContainer';
	this.piecesContainer.name = 'piecesContaier';
	this.possibleMovesContainer.name = 'possibleMovesContainer';
	this.mesh.add(this.boardContainer)
	this.mesh.add(this.piecesContainer)
	this.mesh.add(this.possibleMovesContainer)
	this.scene.add(this.mesh);
	
	let bottom = 0;
	let left = 0;
	for (let w = 0; w < this.n; w++){
		for(let i = 0; i < this.n; i++){
			let z = i;
			let opacity = 0.4;
			let checker = BoardGraphics.checkerboard3d(this.n, this.n * this.squareSize, z, w, opacity, this.boardHeight) // Construct 2D checkerboard planes
			checker.position.set(0, bottom + i*this.verticalIncrement, left - w*this.horizontalIncrement)
			rotateObject(checker, -90, 0, 0)
			this.boardContainer.add(checker)
		}
	}
}

BoardGraphics.checkerboard = function(segments=8, boardSize=100, z=0, w=0, opacity=0.5){
    
    let geometry = new THREE.PlaneGeometry(boardSize, boardSize, segments, segments)
    let materialEven = new THREE.MeshBasicMaterial({color: 0xccccfc})
    let materialOdd = new THREE.MeshBasicMaterial({color: 0x444464})
    let materials = [materialEven, materialOdd]

    materials.forEach(m => {
        m.transparent = true
        m.opacity = opacity
        m.side = THREE.DoubleSide;
    })

    let i = j = 0;

    for(let x = 0; x < segments; x++){
      for(let y = 0; y < segments; y++){
          let i = x * segments + y
          let j = i * 2
          geometry.faces[j].materialIndex = geometry.faces[j + 1].materialIndex = (x + y + z + w) % 2
      }
    }
	
    return new THREE.Mesh(geometry, materials)
}

BoardGraphics.checkerboard3d = function(segments=8, boardSize=100, z=0, w=0, opacity=0.5, boardHeight=5){
	
	const BOARD_HEIGHT = boardHeight;
	
	let topGeometry = new THREE.PlaneGeometry(boardSize, boardSize, segments, segments);
	let bottomGeometry = new THREE.PlaneGeometry(boardSize, boardSize, segments, segments);
	let materialsTop = [new THREE.MeshBasicMaterial({color: 0xccccfc}), new THREE.MeshBasicMaterial({color: 0x444464})];
	let materialsBottom = [new THREE.MeshBasicMaterial({color: 0xccccfc}), new THREE.MeshBasicMaterial({color: 0x444464})];
	materialsTop.forEach(m => {
        m.transparent = true;
        m.opacity = opacity;
        m.side = THREE.FrontSide;
    });
	materialsBottom.forEach(m => {
        m.transparent = true
        m.opacity = opacity
        m.side = THREE.BackSide;
    });
	for(let x = 0; x < segments; x++){
      for(let y = 0; y < segments; y++){
          let i = x * segments + y;
          let j = i * 2;
          topGeometry.faces[j].materialIndex = topGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  bottomGeometry.faces[j].materialIndex = bottomGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2
      }
    }
	
	let topMesh = new THREE.Mesh(topGeometry, materialsTop);
	let bottomMesh = new THREE.Mesh(bottomGeometry, materialsBottom);
	bottomMesh.position.set(0, 0, -BOARD_HEIGHT);
	
	let sideGeometry = new THREE.PlaneGeometry(BOARD_HEIGHT, boardSize, 1, segments);
	let materialsSide = [new THREE.MeshBasicMaterial({color: 0x444464}), new THREE.MeshBasicMaterial({color: 0xccccfc})];
	materialsSide.forEach(m => {
        m.transparent = true
        m.opacity = opacity
        m.side = THREE.FrontSide;
    });
	for(let x = 0; x < segments; x++){
      for(let y = 0; y < 1; y++){
          let i = x * 1 + y;
          let j = i * 2;
          sideGeometry.faces[j].materialIndex = sideGeometry.faces[j + 1].materialIndex = ((x + y + z + w) % 2) ^ (segments % 2);
      }
    }
	let sideMesh1 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh2 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh3 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh4 = new THREE.Mesh(sideGeometry, materialsSide);
	rotateObject(sideMesh1, 0, 90, 0) //front
	rotateObject(sideMesh2, 90, 0, 90) //left
	rotateObject(sideMesh3, 180, -90, 0) //back
	rotateObject(sideMesh4, -90, 0, -90) //right
	sideMesh1.position.set(boardSize/2, 0, -BOARD_HEIGHT/2)
	sideMesh2.position.set(0, -boardSize/2, -BOARD_HEIGHT/2)
	sideMesh3.position.set(-boardSize/2, 0, -BOARD_HEIGHT/2)
	sideMesh4.position.set(0, boardSize/2, -BOARD_HEIGHT/2)
	
	let boxContainer = new THREE.Group();
	boxContainer.add(topMesh);
	boxContainer.add(bottomMesh);
	boxContainer.add(sideMesh1);
	boxContainer.add(sideMesh2);
	boxContainer.add(sideMesh3);
	boxContainer.add(sideMesh4);
	return boxContainer;
}

BoardGraphics.prototype = {
	
	getBoundingBox: function() {
		const offset = this.boardSize / 2;
		const originOffset = new THREE.Vector3(offset, 0, -offset);
		const logicalLocalOrigin = originOffset.clone().multiplyScalar(-1);
		const globalLLO = logicalLocalOrigin.clone().add(this.mesh.position);
		
		const globalBottomLeft = logicalLocalOrigin.clone().add(this.mesh.position);
		const halfDiagonal = this.getCenter().sub(globalLLO);
		const extraHeight = new THREE.Vector3(0, this.verticalIncrement, 0);
		const globalTopRight = this.getCenter().clone().add(halfDiagonal).clone().add(extraHeight);
		
		const extraSpace = new THREE.Vector3(this.squareSize * 0, 0, -this.squareSize)
		
		return {
			bottomLeft: globalBottomLeft.sub(extraSpace),
			topRight: globalTopRight.add(extraSpace)
		};
	},
	
	getCenter: function(){
		const numHalfBoards = (this.n - 1) / 2;
		const localZ = -(this.boardSize + this.horizontalGap) * numHalfBoards;
		const localY = this.verticalIncrement * numHalfBoards;
		const localCenter = new THREE.Vector3(0, localY, localZ);
		return localCenter.add(this.mesh.position);
	},
	
	boardCoordinates: function(x, y, z, w){
        
        // Get world coordinates from board coordinates
        const zero = new THREE.Vector3((0.5 * this.squareSize) - (0.5 * this.squareSize * this.n), 0, (0.5 * this.squareSize * this.n) - (0.5 * this.squareSize))
        
        const xShift = x * this.squareSize
        const yShift = y * this.verticalIncrement + this.EPSILON
        const zShift = -(z * this.squareSize + w * this.horizontalIncrement)
        const translation = new THREE.Vector3(xShift, yShift, zShift)
        
        return zero.add(translation).add(this.boardContainer.position)
    },
	
	worldCoordinates: function(pos){
        
        // Get board coordinates from world coordinates
        const zero = new THREE.Vector3((0.5 * this.squareSize) - (0.5 * this.squareSize * this.n), 0, (0.5 * this.squareSize * this.n) - (0.5 * this.squareSize))
        pos = pos.clone().sub(zero).sub(this.boardContainer.position)
        
        let x = Math.floor(pos.x / this.squareSize)
        let y = Math.floor(pos.y / this.verticalIncrement)
        let numGaps = Math.floor(-pos.z / this.horizontalIncrement)
        let z = Math.floor((-pos.z - (numGaps * this.horizontalIncrement)) / this.squareSize)
        let w = numGaps
        
        return new THREE.Vector4(x, y, z, w)
    },
	
	showPossibleMoves: function(locations, piece, materialScheme={}, canRayCast){
		materialScheme = Object.assign({
			0: {
				moveMaterial: Models.materials.green,
				attackMaterial: Models.materials.red
			},
			1: {
				moveMaterial: Models.materials.green,
				attackMaterial: Models.materials.red
			},
		}, materialScheme)
		
        this.hidePossibleMoves();
		
        locations.forEach(pos => {
			
			let coordinates = this.boardCoordinates(pos.x, pos.y, pos.z, pos.w)
			let material;
			let shadowPiece;
			if(pos.possibleCapture){
				const attackedPiece = this.gameBoard.pieces[pos.x][pos.y][pos.z][pos.w]
				material = materialScheme[piece.team].attackMaterial;
				shadowPiece = Models.createMesh(attackedPiece.type, material, coordinates.x, coordinates.y, coordinates.z, 1, canRayCast)
				if(attackedPiece.team === 0){
					rotateObject(shadowPiece, 0, 180, 0)
				}
			} else {
				let material = materialScheme[piece.team].moveMaterial;
				shadowPiece = Models.createMesh(piece.type, material, coordinates.x, coordinates.y, coordinates.z, 1, canRayCast)
			}
				
			this.possibleMovesContainer.add(shadowPiece)
        });
        
    },
    
    showPossibleMoves2: function(x, y, z, w, materialScheme){
      
        const locations = this.pieces[x][y][z][w].getPossibleMoves(this.pieces, x, y, z, w)
        
        this.showPossibleMoves(locations, piece, materialScheme, true)
        
    },
    
    hidePossibleMoves: function(objectName='possibleMoves'){
        while(this.possibleMovesContainer.children.length){
			const mesh = this.possibleMovesContainer.children[0]
			Selector.unhighlight(mesh)
            this.possibleMovesContainer.remove(mesh);
        }
    },
	
	moveMesh: function(piece, x1, y1, z1, w1){
		const currentMeshCoords = piece.mesh.position
        const newMeshCoords = this.boardCoordinates(x1, y1, z1, w1)
        
        const frames = 12
        const interpolatedCoords = Animation.linearInterpolate(currentMeshCoords, newMeshCoords, frames)
        Animation.addToQueue(this.animationQueue, piece.mesh, interpolatedCoords)
        piece.mesh.canRayCast = false // temporarily disable piece's ability to be found in rayCast
        
        this.animationQueue[this.animationQueue.length - 1].onAnimate = function(){
            piece.mesh.canRayCast = true // re-enable piece's ability to be found in rayCast
            if(piece.type === 'pawn' && this.isOnPromotionSquare(x1, y1, z1, w1)){
				// Normal capture logic and animation is still executed,
				// but here we remove the pawn's sprite and spawn in a queen
				// Notice that we do not use GameObject.removePiece() method because
				// it will also remove its game object, which is logic that should 
				// be separate from graphics
				this.graphics.removeMesh(piece)
				this.graphics.addToPiecesContainer(piece.descendant.mesh); // Only add mesh to scene when animation is finished
//				this.graphics.piecesContainer.add(queen.mesh); 
            }
        }.bind(this.gameBoard)
	},
	
	createMesh: function(typeString, team, x, y, z, w, addToContainer=true){ 
		// Create mesh (without game object), add it to the scene, and return the mesh
		const worldPos = this.boardCoordinates(x, y, z, w)
		const material = team === 0 ? Models.materials.white : Models.materials.black
		const mesh = Models.createMesh(typeString, material, worldPos.x, worldPos.y, worldPos.z)
		if(team === 0) rotateObject(mesh, 0, 180, 0)
		if(addToContainer){
			this.piecesContainer.add(mesh)
		}
		return mesh
	},
	
	setMesh: function(piece, x, y, z, w, addToContainer=true){
		const mesh = this.createMesh(piece.type, piece.team, x, y, z, w, addToContainer);
        piece.setMesh(mesh);
	},
	
	removeMesh: function(piece){
		this.piecesContainer.remove(piece.mesh);
	},
	
	respawnMesh: function(piece, x, y, z, w){
		if (piece.mesh) {
			this.piecesContainer.add(piece.mesh);
		} else {
			piece.mesh = this.createMesh(piece.type, piece.team, x, y, z, w, true);
		}
		
	},
	
	setSelectability: function(piece, canMove) {
		piece.mesh.selectable = canMove;
	},
	
	addToPiecesContainer: function(mesh) {
		this.piecesContainer.add(mesh); 
	},
	
	abandon: function() {
		this.scene.remove(this.mesh)
	}
	
}

function EmptyBoardGraphics(gameBoard, scene) {

}

EmptyBoardGraphics.prototype = {
	
	getBoundingBox: function() {},
	
	getCenter: function(){},
	
	boardCoordinates: function(x, y, z, w){},
	
	worldCoordinates: function(pos){},
	
	showPossibleMoves: function(locations, piece, materialScheme={}, canRayCast){},
    
    showPossibleMoves2: function(x, y, z, w, materialScheme){},
    
    hidePossibleMoves: function(objectName='possibleMoves'){},
	
	moveMesh: function(piece, x1, y1, z1, w1){},
	
	createMesh: function(typeString, team, x, y, z, w, addToContainer=true){},
	
	setMesh: function(piece, x, y, z, w, addToContainer=true){},
	
	removeMesh: function(piece){},
	
	respawnMesh: function(piece){},
	
	setSelectability: function(piece, canMove) {},
	
	addToPiecesContainer: function(mesh) {},
	
	abandon: function() {}
	
}

export default BoardGraphics;
export { EmptyBoardGraphics };