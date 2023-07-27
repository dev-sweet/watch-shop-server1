const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

// mongo db uri and mongodb client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DP_PASS}@cluster0.mas8d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("watch_shop");

    // collections
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    // get all products or limited products if you want
    app.get("/products", async (req, res) => {
      const limit = parseInt(req.query.limit);
      let products;
      if (limit) {
        const result = productsCollection.find({}).limit(limit);
        products = await result.toArray();
      } else {
        const result = productsCollection.find({});
        products = await result.toArray();
      }

      res.json(products);
    });

    // get products by product id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(filter);

      res.json(product);
    });

    // post a product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
      console.log(result);
    });

    // delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      console.log(result);
      res.json(result);
    });

    // post user to users collection
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // put user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };

      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });

    // make an admin
    app.put("/users/admin", async (req, res) => {
      const email = req.body.email;

      const filter = { email: email };
      const updateDoc = { $set: { role: "admin" } };

      const result = await usersCollection.updateOne(filter, updateDoc);

      res.json(result);
    });

    //  test admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      console.log(email);
      const user = await usersCollection.findOne(filter);
      console.log(user);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // work with orders collection

    // post order to orders collection
    app.post("/orders", async (req, res) => {
      const orderInfo = req.body;
      const result = await ordersCollection.insertOne(orderInfo);
      res.json(result);
    });

    // get all orders
    app.get("/orders", async (req, res) => {
      const result = ordersCollection.find({});
      const orders = await result.toArray();
      res.json(orders);
    });

    // get order by user email address
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { email: email };
      const result = ordersCollection.find(filter);
      const orders = await result.toArray();

      res.json(orders);
    });

    // change pending status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };

      const updateDoc = { $set: { status: "shipped" } };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // delete orders
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
      console.log(result);
    });

    // post to reviews collection
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
      console.log(result);
    });

    // get reviews from reviews collection
    app.get("/reviews", async (req, res) => {
      const result = reviewsCollection.find({});
      const reviews = await result.toArray();
      res.json(reviews);
    });
  } finally {
  }
}
run().catch(console.dir());
app.get("/", (req, res) => {
  res.send("Watch shop server is running...");
});

app.listen(port, () => {
  console.log(`watch shop server running at port : ${port}`);
});
