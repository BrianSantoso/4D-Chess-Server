/* SHELL SCRIPT */
use chess4d
db.dropDatabase()
use chess4d
db.createCollection('users')
db.users.insert({
	username: 'AnonPig',
	elo: 1000,
	joinDate: new Date(),
	lastLogin: new Date(),
});

db.createCollection('userCredentials')
db.userCredentials.insert({
	id: '',
	email: '',
	pass: '',
});