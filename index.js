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
        const categoriesCollection = client.db("deals-of-the-day").collection("categories");
        const productsCollection = client.db("deals-of-the-day").collection("products");
        const bookingsCollection = client.db("deals-of-the-day").collection("bookings");

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


        // Send Product Category
        app.get("/all-category", async (req, res) => {
            const query = {};
            const allCategory = await categoriesCollection.find(query).toArray();
            res.send(allCategory);
        })

        // 

        // Save Product Into DataBase
        app.post("/add-product", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })


        // Send Category Wise Product
        app.get("/category/:category_name", async (req, res) => {
            const category = req.params.category_name;
            const query = { category: category }
            const categoryProduct = await productsCollection.find(query).toArray();
            res.send(categoryProduct)
        })


        // Store Booking Product
        app.post("/store-booking-product", async (req, res) => {
            const bookingProductDetails = req.body;
            const result = await bookingsCollection.insertOne(bookingProductDetails);
            res.send(result);
        })


        // Send Booking Product By Their Specific Email
        app.get("/myOrders", async (req, res) => {
            const email = req.query.email;
            const query = { buyerEmail: email }
            const userOrders = await bookingsCollection.find(query).toArray();
            res.send(userOrders);
        })







        // Send Product By Their Category
        app.get("/product/:category", async (req, res) => {
            const category = req.params.category;
            const query = { category: category }

            const product = await productsCollection.find(query).toArray();
            res.send(product);
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