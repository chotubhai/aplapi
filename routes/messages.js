const express = require('express')
const passport = require('passport')
const router = express.Router()
const User=require("../models/User");
const {auth} =require('../middlewares/auth')
const cricLive = require('cric-live')
const score = require('cricket-api-node')




router.get("/chat",auth,(req,res)=>
{
    
    
   
})






module.exports = router