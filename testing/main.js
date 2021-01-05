import Mongo, { MongoClient } from 'mongodb';

// Optional: poolSize
//  this allows you to control how many tcp connections are opened in parallel.
MongoClient.connect('mongodb://localhost:27017/exampleDb', (err, db) => {
    if (err) {
        console.dir(err);
        return;
    }
    console.log('Connected to mongo database');

    db.collection('test', (err, collection) => {});
    
    // db.createCollection('test', (err, collection) => {});


});