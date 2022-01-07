const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String
    },
    secretKey:{
        type:String
    }
})

module.exports = model('User',userSchema)