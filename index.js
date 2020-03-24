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

let gameRooms = {}
io.on('connect', (socket) => {
	console.log('socket connected: ', socket.id)
  	// add custom event listeners here
	let room; // capture the room in our closure
	
	function joinGameRoom(gameID) {
		console.log('\tLeaving previous room: ', room)
		socket.leave(room)
        room = `room_${gameID}`;
		console.log('\trequested to join: ', gameID, room);
		
		if (!gameRooms[room]) {
			console.log('RoomID ', room, 'not found. Creating new GameRoom')
			gameRooms[room] = new GameRoom(gameID);
		}
		const playerAssignment = gameRooms[room].addSocket(socket);
		socket.broadcast.to(room).emit('player joined', playerAssignment);
		socket.emit('player assignment', playerAssignment);
	}
	socket.on('join', joinGameRoom);
	
//	socket.on('join', (gameID) => {
//		console.log('\tLeaving previous room: ', room)
//		socket.leave(room)
//        room = `room_${gameID}`;
//		console.log('\trequested to join: ', gameID, room);
//		
//		if (!gameRooms[room]) {
//			gameRooms[room] = new GameRoom(gameID);
//		}
//		const playerAssignment = gameRooms[room].addSocket(socket);
//		
//		socket.emit('player assignment', playerAssignment);
//    });
	socket.on('submit move', (move) => {
		console.log(room, 'received move', move)
		socket.broadcast.to(room).emit('serve move', move);
	})
	socket.on('chat message', (message) => {
        console.log('got message', message);
        io.to(room).emit('chat message', message);
    });
	
//	if(requestedGameID) {
//		joinGameRoom(requestedGameID);
//	}
});

server.listen(PORT, () => {
	console.log('\t :: Express :: Listening on port ' + PORT );
});

function genGameId() {
	return 'gxxxxxxx'.replace(/[x]/g, function(character) {
		const r = Math.random() * 16 | 0
		const v = character == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function GameRoom(gameID) {
	this.roomID = `room_${gameID}`;
	this.players = []
	this.spectators = []
	
	this.addSocket = function(socket) {
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
		return playerAssignment;
	}
}

GameRoom.join = function(gameID, socket) {
	
}

console.log(genGameId())
console.log(genGameId())
console.log(genGameId())
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
