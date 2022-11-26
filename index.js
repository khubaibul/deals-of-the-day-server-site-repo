const express = require('express');
const cors = require('cors');
require("colors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
        const advertiseCollection = client.db("deals-of-the-day").collection("advertise");
        const bookingsCollection = client.db("deals-of-the-day").collection("bookings");
        const wishlistCollection = client.db("deals-of-the-day").collection("wishlist");
        const paymentsCollection = client.db("deals-of-the-day").collection("payments");

        // Save User Info
        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            // const userEmail = user.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            }

            const result = await usersCollection.updateOne(filter, updatedDoc, options);

            res.send({ result })
        })


        // Send All Sellers To Admin 
        app.get("/all-sellers", async (req, res) => {
            const query = { buyerOrSeller: "Seller" }
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })


        // Send All Buyers To Admin
        app.get("/all-buyers", async (req, res) => {
            const query = {};
            const allUsers = await usersCollection.find(query).toArray();
            const notSellers = allUsers.filter(user => user.buyerOrSeller !== "Seller")
            const buyers = notSellers.filter(user => user.buyerOrSeller !== "Admin")
            res.send(buyers);
        })


        // Update Seller Verification
        app.put("/seller-verification", async (req, res) => {
            const email = req.body.email;
            const filter = { sellerEmail: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verification: "Verified"
                },
            }

            const result = await productsCollection.updateMany(filter, updatedDoc, options);
            res.send(result)
        });


        // Delete Seller
        app.delete("/seller-delete/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })


        // Delete Buyer
        app.delete("/buyer-delete/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
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


        // Send Specific Sellers Product By Their Gmail
        app.get("/myProducts", async (req, res) => {
            const sellerEmail = req.query.email;
            const query = { sellerEmail: sellerEmail };
            const allProducts = await productsCollection.find(query).toArray();
            res.send(allProducts)

        })


        // Add Advertisement Specific Product
        app.post("/advertise-product", async (req, res) => {
            const advertisedProduct = req.body;

            const query = {};
            const alreadyAdvertisedProducts = await advertiseCollection.find(query).toArray();

            const isAlredyAdded = alreadyAdvertisedProducts.find(product => product._id === advertisedProduct._id);
            if (!isAlredyAdded) {
                const result = await advertiseCollection.insertOne(advertisedProduct)
                res.send(result);
            }
            else {
                res.send({ message: "Already Exist In Advertisement..." })
            }
        })


        // Send Advertisement Product
        app.get("/advertisement-products", async (req, res) => {
            const query = {};
            const allAdvertisedProduct = await advertiseCollection.find(query).toArray();
            res.send(allAdvertisedProduct)
        })



        // Delete Specific Sellers Product By Product ID
        app.delete("/delete-product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        // Send Category Wise Product
        app.get("/category/:category_name", async (req, res) => {
            const category = req.params.category_name;
            const query = { category: category }
            const categoryProduct = await productsCollection.find(query).toArray();
            const availableProduct = categoryProduct.filter(product => !product.paid)
            res.send(availableProduct)
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


        // TODO
        // Send Specific Booking Product By ID
        app.get("/booking-payment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bookingProduct = await productsCollection.findOne(query);
            res.send(bookingProduct);
        })


        // Store Wishlist Product From Specific User
        app.post("/add-to-wishlist", async (req, res) => {
            const wishlistProduct = req.body;
            const productId = wishlistProduct.productId;
            const buyerEmail = wishlistProduct.buyerEmail;
            const filter = { productId: productId, buyerEmail: buyerEmail }
            const alreadyAdded = await wishlistCollection.find(filter).toArray();

            if (alreadyAdded.length === 0) {
                const result = await wishlistCollection.insertOne(wishlistProduct);
                return res.send(result);
            }
            res.send({ message: "Already Added" })

        })


        // Send Wishlist Product By Their Email
        app.get("/my-wishlist/:email", async (req, res) => {
            const buyerEmail = req.params.email;
            const query1 = { buyerEmail: buyerEmail }
            const wishlistProducts = await wishlistCollection.find(query1).toArray();
            const query2 = {};
            const products = await productsCollection.find(query2).toArray();
            const alreadySold = products.filter(product => product.paid);

            const remainingProducts = wishlistProducts.filter(product =>
                alreadySold.map(sold => sold._id !== product.productId)
            )










            res.send(remainingProducts)
        })



        // Stripe
        app.post("/create-payment-intent", async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });

        });


        // Store Successful Payment Information
        app.post("/payment", async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);

            const id = payment.bookingId;
            const query1 = { _id: ObjectId(id) };
            const query2 = { productId: id };
            const deleteQuery = { _id: id };
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }

            const updatePaymentStatusInBookingCollection = await bookingsCollection.updateOne(query2, updateDoc);
            const updatePaymentStatusInProductCollection = await productsCollection.updateOne(query1, updateDoc);
            const deleteFromAdvertisementCollection = await advertiseCollection.deleteOne(deleteQuery)
            res.send(result);
        })



        // Load Specific User By Email
        app.get("/user/admin/:email", async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user.isAdmin === "Admin") {
                return res.send({ isAdmin: "Admin" })
            }
            else {
                res.send({ isAdmin: false })
            }
        })


        // Load Specific User By Email
        app.get("/user/seller/:email", async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user.buyerOrSeller === "Seller") {
                res.send({ isSeller: "Seller" })
            }
            else {
                return res.send({ isAdmin: false })
            }
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