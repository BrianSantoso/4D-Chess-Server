const PORT = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const publicPath = path.join(__dirname, 'public');

let THREE = {
	Vector3: function Vector3(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

function EmptyUI() {
	this.setState = function(state) {
		console.warn('proxy setState called before react component mounted')
	}
	this.exitMenu = function() {
		console.warn('proxy exitMenu called before react component mounted')
	}

}

let toolbarProxy = new EmptyUI();
eval(fs.readFileSync('./public/js/three.js')+'');
eval(fs.readFileSync('./public/js/gameboard.js')+'');
eval(fs.readFileSync('./public/js/movemanager.js')+'');
eval(fs.readFileSync('./public/js/piece.js')+'');
eval(fs.readFileSync('./public/js/mode.js')+'');


app.get('/:gameID(g[A-Za-z0-9]{7})', (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'));
});
app.use(express.static('public'));
app.use('/sandbox', express.static('public'));
app.use('/localGame', express.static('public'));

let gameRooms = {}
let matchmaker = new MatchMaker();
let socketsOnline = 0;

io.on('connect', (socket) => {
	// add custom event listeners here
	console.log('socket connected: ', socket.id)
	socketsOnline += 1;
	
	socket.on('join', (gameID) => {
		GameRoom.join(socket, gameID)
	});
	
	socket.on('matchmake', () => {
		matchmaker.matchmake(socket)
	});
	
	socket.on('submit move', (move) => {
		console.log(socket.room, 'received move', move)
		GameRoom.move(socket, move);
		socket.broadcast.to(socket.room).emit('serve move', move);
	})
	
	socket.on('chat message', (message) => {
        console.log('got message', message);
        io.to(socket.room).emit('chat message', message);
    });
	
	socket.on('disconnect', () => {
		console.log('socket disconnected ', socket.id)
		matchmaker.remove(socket);
		GameRoom.disconnect(socket);
		socketsOnline -= 1;
	});
});

server.listen(PORT, () => {
	console.log('\t :: Express :: Listening on port ' + PORT );
});



function GameRoom(gameID) {
	
	// TODO: close gameroom on disconnects
	this.roomID = `room_${gameID}`;
	this.players = []
	this.spectators = []
	this.numSockets = 0;
	this.gameManager = new MoveManager(new GameBoard(4, EmptyBoardGraphics), -2, Mode.ONLINE_MULTIPLAYER);
	
	this.addSocket = function(socket) {
		GameRoom.disconnect(socket);
		
		socket.room = this.roomID;
		socket.join(this.roomID);
		console.log('\tsocket ', socket.id, 'joined room ', this.roomID)
		let playerAssignment = {
			gameData: this.gameManager.package()
		}
		if (this.players.length < 2) {
			this.players.push(socket)
			Object.assign(playerAssignment, {
				clientTeam: this.players.length - 1,
				ready: this.players.length == 2
			})
		} else {
			this.spectators.push(socket)
			Object.assign(playerAssignment, {
				clientTeam: -1,
				ready: true
			})
		}
		this.numSockets += 1;
//		console.log(playerAssignment)
		return playerAssignment;
	}
	
	this.removeSocket = function(socket) {
		this.numSockets -= 1;
		if (this.numSockets <= 0) {
			console.log('disbanding game room: ', this.roomID);
			delete gameRooms[this.roomID]
		}
	}
}

GameRoom.new = function() {
	const gameID = GameRoom.genGameId();
	const room = `room_${gameID}`;
	gameRooms[room] = new GameRoom(gameID);
	return gameRooms[room];
}

GameRoom.disconnect = function(socket) {
	console.log('\tLeaving previous room: ', socket.room)
	// removes socket from its current room
	const gameRoom = gameRooms[socket.room];
	if (gameRoom) {
		gameRoom.removeSocket(socket);
	}
	socket.leave(socket.room);
}

GameRoom.genGameId = function() {
	return 'gxxxxxxx'.replace(/[x]/g, function(character) {
		const r = Math.random() * 16 | 0
		const v = character == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

GameRoom.join = function(socket, gameID) {
	console.log('\trequested to join: ', gameID);
	const room = `room_${gameID}`;
	if (!gameRooms[room]) {
		console.log('RoomID ', room, 'not found. Creating new room')
		gameRooms[room] = new GameRoom(gameID);
	}
	
	const playerAssignment = gameRooms[room].addSocket(socket);
	console.log(playerAssignment)
	socket.broadcast.to(room).emit('player joined', playerAssignment);
	socket.emit('player assignment', playerAssignment);
	
}

GameRoom.move = function(socket, move) {
	const gameRoom = gameRooms[socket.room];
	gameRoom.gameManager.move(move.x0, move.y0, move.z0, move.w0, move.x1, move.y1, move.z1, move.w1, true);
}

function MatchMaker() {
	this.q = []
	
	this.matchmake = function(socket) {
		this.addToQ(socket);
		console.log('adding socket ', socket.id, 'to matchmaking queue')
		while (this.q.length >= 2) {
			const socket1 = this.q[0];
			const socket2 = this.q[1];
			const newRoom = GameRoom.new();
			this.remove(socket1);
			this.remove(socket2);
			
			const playerAssignment1 = newRoom.addSocket(socket1);
			socket1.broadcast.to(newRoom.roomID).emit('player joined', playerAssignment1);
			socket1.emit('player assignment', playerAssignment1);
			
			const playerAssignment2 = newRoom.addSocket(socket2);
			socket2.broadcast.to(newRoom.roomID).emit('player joined', playerAssignment2);
			socket2.emit('player assignment', playerAssignment2);
			
			console.log('match found! roomID: ', newRoom.roomID, newRoom)
			console.log('socket1 room: ', socket1.rooms)
			console.log('socket2 room: ', socket2.rooms)
		}
	}
	
	this.addToQ = function(socket) {
		this.q.push(socket);
	}
	
	this.remove = function(socket) {
		const index = this.q.indexOf(socket);
		if (index >= 0) {
			this.q.splice(index, 1);
			console.log('\removed socket ', socket.id, 'from matchmaking queue')
			return true;
		}
		return false;
	}
}