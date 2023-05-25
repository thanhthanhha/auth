// require the necessary libraries
const faker = require("faker");
const { startSession } = require("mongoose");
const { ObjectId } = require('bson');
const MongoClient = require("mongodb").MongoClient;
const fs = require('fs');
require('dotenv').config();
const {MONGO_URI} = process.env;


async function seedDB() {
    const storyFilePath = './seed/stories.json';
    const userFilePath = './seed/users.json';
    const chapterFilePath = './seed/chapters.json';
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const database = client.db('blog')
        console.log('Current working directory:', process.cwd());

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.

        // make a bunch of time series data
        const storiesCollection = database.collection('stories');
        const usersCollection = database.collection('users');
        const chaptersCollection = database.collection('chapters');

        // Read the JSON files
        const storiesData = JSON.parse(fs.readFileSync(storyFilePath));
        const storiesDoc = convertField(storiesData);

        const usersData = JSON.parse(fs.readFileSync(userFilePath));
        const usersDoc = convertField(usersData);

        const chaptersData = JSON.parse(fs.readFileSync(chapterFilePath));
        const chaptersDoc = convertField(chaptersData);

        // Insert the data into respective collections
        await usersCollection.insertMany(usersDoc);
        await chaptersCollection.insertMany(chaptersDoc);
        await storiesCollection.insertMany(storiesDoc);
        console.log("Database seeded! :)");
    } catch (err) {
        console.error('Error uploading seed data:', err);
    }
    finally {
        await client.close();
    }
}

function convertField(obj) {
    if (typeof obj !== 'object' || obj == null) {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map(convertField)
    }

    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key].hasOwnProperty('$oid')) {
                result[key] = new ObjectId(obj[key]['$oid']);
            } else {
                result[key] = convertField(obj[key])
            }
        }
    }

    return result;
}

seedDB()