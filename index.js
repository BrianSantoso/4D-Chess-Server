const PORT = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const public = path.join(__dirname, 'public');

//let requestedGameID;
app.get('/:gameID(g[A-Za-z0-9]{7})', (req, res) => {
//	console.log('url gameID: ', req.params)
//	let requestedGameID = req.params.gameID;
//	console.log('accessed thru url gameID: ', requestedGameID)
//	res.json({requestedGameID: requestedGameID})
	res.sendFile(path.join(public, 'index.html'));
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
	
	this.addSocket = function(socket) {
		GameRoom.disconnect(socket);
		
		socket.room = this.roomID;
		socket.join(this.roomID);
		console.log('\tsocket ', socket.id, 'joined room ', this.roomID)
		let playerAssignment = {}
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
	socket.broadcast.to(room).emit('player joined', playerAssignment);
	socket.emit('player assignment', playerAssignment);
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
//app.get('/[A-Za-z0-9].*', function (req, res) {
//	res.send('GET request to the homepage')
//	console.log('stuff after slash found')
//});
//app.use(express.static('public'));
//app.get(/[A-Za-z0-9].+/, function (req, res) {
//	res.sendFile(__dirname + '/public/index.html');
//	console.log('reeeeeeeeeeee')
//});
//app.use(/a/, express.static('public'))
//app.use('/', express.static('public'))
//app.use('/g', express.static('public'))
//app.get('/', (req, res) => {
//    res.send('An alligator approaches!');
//	console.log('reeeeeeeeeeee')
//});
//app.use((req, res, next) => {
//  const test = /\?[^]*\//.test(req.url);
//  if (req.url.substr(-1) === '/' && req.url.length > 1 && !test)
//    res.redirect(301, req.url.slice(0, -1));
//  else
//    next();
//});

//app.use('/css', express.static(path.join(public, 'css')))
//app.use('/icons', express.static(path.join(public, 'icons')))
//app.use('/js', express.static(path.join(public, 'js')))
//app.use('/models', express.static(path.join(public, 'models')))
