const express = require('express');
const jwt = require("jsonwebtoken");


const { VoterDetails, CandidateDetails, Election } = require("../models/GiveVoteSchema")



const checkUserAuth = async (req,res,next) =>{
    try{
        console.log("req.cookies.LogIn:",req.cookies.LogIn);
        const token =  req.cookies.LogIn; //for access jwt cookies of browser
        console.log("token",token);
        
        const verifyUser =await jwt.verify(token,process.env.JWT_SECRET);
        console.log(verifyUser.id);

        //get the user data of verfy user by the id of tocken
        const user= await VoterDetails.findById(verifyUser.id)
         console.log("user details:",user);

        req.token = token;
        req.user= user;
        next();

    } catch(error){
        console.log(error);
    }
} 

module.exports = {checkUserAuth};