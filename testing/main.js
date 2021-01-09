import Mongo, { MongoClient } from 'mongodb';

// Optional: poolSize
//  this allows you to control how many tcp connections are opened in parallel.
MongoClient.connect('mongodb://localhost:27017/chess4d', (err, client) => {
    if (err) {
        console.dir(err);
        return;
    }
    console.log('Connected to mongo database');

    // db.collection('test', (err, collection) => {});
    
    // db.createCollection('test', (err, collection) => {});
    // db.collection('users').find().pretty();
    let db = client.db('chess4d');
    let users = db.collection('users');
    users.find({}).toArray((err, user) => {
        console.log(JSON.stringify(user, null, 2));
    });
    // console.log(JSON.stringify(users, null, 2));
});