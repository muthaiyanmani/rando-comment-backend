require('dotenv').config();
require('./config/database').connect()
const express = require("express")
const User = require("./models/user")
const app = express();
const bcrypt = require('bcryptjs')
app.use(express.json())
 
app.get('/',(req,res)=>{
    res.send("<h1>Hello World</h1>")
})

app.post('/signup',async (req,res)=>{
   const {email,password} = req.body;

   if(!(email && password)){
       res.status(400).send("All fields are mandatory")
   }

   const existingUser =await User.findOne({email});
   if(existingUser){
       res.status(401).send("Email already exists")
   }

   const myEncPassword = await bcrypt.hash(password,10);

   const user = User.connect({
       email:email.toLowerCase(),
       password:myEncPassword,
       token
   })

   const 
})

module.exports = app;