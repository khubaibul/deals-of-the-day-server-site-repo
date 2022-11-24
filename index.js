const express = require('express');
const cors = require('cors');
require("colors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mogodb-practice.uoisaxb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// API
app.get("/", (req, res) => {
    res.send("Deal Of The Day Server Is Running...")
})


// Database Connection Function
async function dataBase() {
    try {
        const usersCollection = client.db("deals-of-the-day").collection("users");

        // Save User Info
        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            }

            const result = await usersCollection.updateOne(filter, updatedDoc, options);

            res.send({ result })
        })

    }
    catch (err) {
        console.log(err.message.bgRed.bold)
        console.log(err.stack.bgBlue.bold)
    }

}

dataBase().catch(err => console.log(err.bold.bgRed))

// Listen
app.listen(port, () => {
    console.log(`Server Is Running On ${port}`.bgCyan.bold);
})