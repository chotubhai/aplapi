const express = require('express')
const passport = require('passport')
const router = express.Router()
const User=require("../models/User");
const {auth} =require('../middlewares/auth')
const formatMessage = require('../utils/messages');
const randomWords = require('random-words');
const {ensureAuth ,ensureGuest}=require("../middlewares/authp")
const cricapi = require("cricapi");
const http = require('http')
const axios = require('axios');
const { response } = require('express');
const auctionControllers = require('../controllers/Auction')

const key = "lTnE4tXFYcQdK1eADdrmAaNi82A3"
cricapi.setAPIKey(key)
const fetchMatchList = async () =>{
  axios
  .post('https://cricapi.com/api/matches', {
    apikey: 'lTnE4tXFYcQdK1eADdrmAaNi82A3',
    
  })
  .then(response => { 
    return response["data"].matches
  })
  .catch(error => {
    console.error(error)
    return next(error)
  })
}
router.post('/createauction', auctionControllers.createAuction)
//squad api
// player details
//fetch player by id


// call this for match list
router.get("/",(req,res, next)=>
{
   res.render("auction",{layout:"main"})
}) 
router.post("/matchList", fetchMatchList)
//call this for squad list
router.post("/squadList",(req,res)=>
{
  console.log(req.body.id)
    axios
  .post('https://cricapi.com/api/fantasySquad', {
    unique_id:req.body.id,
    apikey: 'lTnE4tXFYcQdK1eADdrmAaNi82A3'
    
  })
  .then(res => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(res["data"]["squad"][0]["players"])
    console.log(res["data"]["squad"][1]["players"])
  })
  .catch(error => {
    console.error(error)
  })
})


exports.fetchMatchList = fetchMatchList













module.exports = router