const mongoose = require("mongoose");
const {DB_URL} = process.env;

exports.connect = ()=>{
    mongoose.connect(DB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>console.log(`DB Connected successfully`))
    .catch((err)=>{
        console.log(`DB connection Failed!`);
        process.exit(1);
    })
}