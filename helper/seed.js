/* mySeedScript.js */

// require the necessary libraries
const faker = require("faker");
const { startSession } = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function seedDB() {
    // Connection URL
    const uri = "mongodb://test:Blud12345@localhost:27017/";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const collection = client.db("auth").collection("user");

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.

        // make a bunch of time series data
        let timeSeriesData = [];
        let firstName = faker.name.firstName();
        let lastName = faker.name.lastName();
        for (let i = 0; i < 10; i++) {
            let newDay = {
                username: faker.internet.userName(),
                password: faker.internet.password(),
                timestamp_day: faker.date.past(),
                email: faker.internet.email(),
                events: [],
            };
            timeSeriesData.push(newDay);
        }
        console.log(timeSeriesData);
        collection.insertMany(timeSeriesData);
        
        console.log("Database seeded! :)");
        setTimeout(() => {client.close()}, 1500)
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();

