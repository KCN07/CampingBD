const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9v9bb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected");
    const database = client.db("campbd");
    const offeringCollection = database.collection("offerings");
    const myOrderCollection = database.collection('myOrders');

    //GET product api
    app.get("/offerings", async (req, res) => {
      // console.log(req.query);
      const cursor = offeringCollection.find({});
      const offerings = await cursor.toArray();
      res.send(offerings);
    });
    

    //GET Bookings api
    app.get("/bookings", async (req, res) => {
        // console.log(req.query);
        const cursor = myOrderCollection.find({});
        const bookings = await cursor.toArray();
        res.send(bookings);
      });

    //POST API
    app.post('/offerings', async(req, res)=>{
        const offering = req.body;
        console.log('hit the post api', offering);

        const result = await offeringCollection.insertOne(offering);
        console.log(result);
        res.json(result);
    })

    //GET USER BOOKINGS
    app.get('/mybookings/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const result = await myOrderCollection.find(query).toArray();
        res.send(result);
    })

    app.get("/offerings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await offeringCollection.findOne(query);
      // console.log('load user with id: ', id);
      res.send(user);
    });

    // Add myOrders API
    app.post("/myOrders", async (req, res) => {
      const myOrder = req.body;
      const result = await myOrderCollection.insertOne(myOrder);
      res.json(result);
    });

    //UPDATE API
    app.put("/orders/:id", async(req, res)=>{
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              status: updatedUser.status
            },
          };
        const result = await myOrderCollection.updateOne(filter,updateDoc,options)
        console.log('updating user', req);
        res.json(result);
    })

     //DELETE API
     app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await myOrderCollection.deleteOne(query);
  
        console.log("deleting user with id ", result);
  
        res.json(result);
      });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("campbd server is running");
});

app.listen(port, () => {
  console.log("surver is running", port);
});
