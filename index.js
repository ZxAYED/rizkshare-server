const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const axios = require('axios');
const express=require('express')
const cors=require('cors')
require('dotenv').config()
const app =express()
const port =process.env.PORT || 5000

app.use(express.json())
app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials:true,
}))



const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASSWORD}@clusterz.ulyhy8v.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

const availableFoods= client.db('rizkShare').collection('foods')
const requestedFoods= client.db('rizkShare').collection('requestedFoods')

app.get('/RizkShare/availableFoods',async(req,res)=>{

    const result =await availableFoods.find().toArray()
    res.send(result)

})
app.get('/RizkShare/:id',async(req,res)=>{
    const id=req.params.id
    const query={_id: new ObjectId(id) }

    const result =await availableFoods.findOne(query)
    
    res.send(result) 

})
app.post('/RizkShare/RequestedFood',async(req,res)=>{
const cursor =req.body

   const result =await requestedFoods.insertOne(cursor)
    
    res.send(result) 
    console.log(result);

})










  } finally {
    // Ensures that the client will close when you finish/error

  }

}
app.get('/',(req,res)=>{
    res.send('Rizk will come')
  })
  app.listen(port,()=>{
    console.log('Running on server port',port);
  })
run().catch(console.dir);