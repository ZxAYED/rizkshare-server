const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')
// const axios = require('axios');
const express=require('express')
const cors=require('cors')
require('dotenv').config()
const app =express()
const port =process.env.PORT || 5000
require("dotenv").config();
const jwt =require('jsonwebtoken')

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin:['http://localhost:5173'],
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

const verifyToken=(req,res,next)=>{
  const token =req?.cookies.token;

  if(!token){
    return res.status(401).send({message: 'UnAuthorized Access'})
  }
  jwt.verify(token,process.env.TOKEN,(err,decoded)=>{
    if(err)
    return res.status(401).send({message:'UnAuthorize Access'})
  
  req.user =decoded;
})
  next();
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

const availableFoods= client.db('rizkShare').collection('foods')
const requestedFoods= client.db('rizkShare').collection('requestedFoods')




app.post('/jwt',  async (req, res) => {
  const user = req.body;
  console.log('user for token', user);
  const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

}).send({ success: true });
})
      

// app.post('/rizkShare/jwt',async(req,res)=>{

//   const user =req.body

//   const token=jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });
//   res.cookie('token', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', 
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

// })
//   // res.cookie('token',token,{
//   //   httpOnly:true,
//   //   secure:true
//   // }).send({success:true})


// })
app.post('/rizkShare/logOut',async(req,res)=>{
  const user=req.body;
  res.clearCookie('token',{maxAge:'0'}.send({success:true}))

})

app.get('/RizkShare/availableFoods',async(req,res)=>{

    const result =await availableFoods.find().toArray()
    res.send(result)

})
app.post('/RizkShare/availableFoods',async(req,res)=>{

  const cursor =req.body

  const result =await availableFoods.insertOne(cursor)
   
   res.send(result) 
  
})
app.get('/RizkShare/SingleFood/:id',async(req,res)=>{
    const id=req.params.id
    const query={_id: new ObjectId(id) }

    const result =await availableFoods.findOne(query)
    
    res.send(result) 

})
app.post('/RizkShare/RequestedFood',async(req,res)=>{
const cursor =req.body

   const result =await requestedFoods.insertOne(cursor)
    
    res.send(result) 


})
// verifyToken
app.get('/RizkShare/RequestedFood',verifyToken,async(req,res)=>{
 
  // console.log(req.cookies.token);
  console.log( 'user in the valid token',req.user);
  if(req.user.email!==req.query.email){
    return res.status(403).send({message:'Forbidden Access'})
  }
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }

  

  const result =await requestedFoods.find(query).toArray()
  res.send(result)

})


  

app.delete('/RizkShare/availableFoods/:id',async(req,res)=>{
const id  =req.params.id

const query ={_id :new ObjectId(id)}
const result =await  availableFoods.deleteOne(query)
res.send(result)

})
app.delete('/RizkShare/RequestedFood/:id',async(req,res)=>{
const id  =req.params.id

const query ={_id :new ObjectId(id)}
const result =await  requestedFoods.deleteOne(query)
res.send(result)

})
app.patch('/RizkShare/availableFoods/:id',async(req,res)=>{
const data =req.body
const id =req.params.id
const query ={_id :new ObjectId(id)}
const option ={upsert :true}
const update = { $set:data };

const result =await  availableFoods.updateOne(query,update,option)
res.send(result)

})

// verifyToken
app.get('/RizkShare/ManageFoods',verifyToken,async(req,res)=>{
 
  // console.log(req.cookies.token);
  console.log( 'user in the valid token',req.user);
  let query = {};
  if (req.query?.email) {
    query = { foodDonatorEmail: req.query.email };
  }

  

  const result =await availableFoods.find(query).toArray()
  res.send(result)

})
app.get('/RizkShare/ManageFoods/:id',async(req,res)=>{
 

  // console.log(req.cookies.token);
  // console.log( 'user in the valid token',req.user);
  const id=req.params.id
    const query={_id: new ObjectId(id) }

    const result =await availableFoods.findOne(query)
    
    res.send(result) 

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