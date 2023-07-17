const mongoose = require('mongoose');

//=============Department==================================================
const Sign_Up = new mongoose.Schema(
    {
        FirstName: {
            type: String,
            required: true,
            index: true,
        },
        LastName: {
            type: String,
            required: true,
            index: true,
        },
        Email: {
            type: String,
            required: true,
            index: true,
        },
        Password: {
            type: String,
            required: true,
            index: true,
        },
        DateofCreate:{
            type:Date,
            default:Date.now
        }
    }
)
const SignUp =new  mongoose.model('SignUp', Sign_Up);

/*=============Export the model==============*/

module.exports={SignUp}