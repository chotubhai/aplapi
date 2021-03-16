const express = require('express')
const passport = require('passport')
const router = express.Router()
const User=require("../models/User");
const {auth} =require('../middlewares/auth')
const formatMessage = require('../utils/messages');
var randomWords = require('random-words');
const {ensureAuth ,ensureGuest}=require("../middlewares/authp")
var multer = require('multer')
var path = require('path')
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS,
  secretAccessKey:process.env.AWS_SECRET_KEY,
})

const key =  Date.now().toString()+".jpeg"
var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'journalr',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null,key)
      }
    })
  })


const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("../utils/users");



botName="ApnaIpl"
router.get("/",ensureGuest,(req,res)=>
{
    res.render("login",{layout:"main"})
    console.log(ensureAuth)
})
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/chat')
  }
)
router.post('/register',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            else
            {
              newuser.username=randomWords() + req.body.lastname
            res.status(200).json({
                succes:true,
                user : doc
            });
          }
        });
    });
 });

 router.post('/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : "Email not found"});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                    user.generateToken((err,user)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            
                       
                        res.status(200).json({message:"Login Successfull", user})
                        }
                        
                });    
            });
          });
        }
    });
});


router.get('/profile',ensureAuth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
        
    })
});
router.get('/logout',ensureAuth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 

router.get("/update",auth,function(req,res)
{
    let token=req.cookies.auth;
    User.findById(req.params._id,function(err,docs)
    {
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log(docs)
        }
    })
})




router.get("/chat",function (req,res)
{
    

console.log(req.body)

req.io.on('connection', socket => {
  socket.on('joinRoom', ({ userId, room,username }) => {
    //const User1=User.findById({userId});
    //console.log(User1);
   console.log("userId",userId);
    //const username=User1.firstName;
    const user = userJoin(socket.id, username, room,userId);
    console.log("connected")
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ApnaIpl!',img));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    req.io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    console.log(user.userId);

    req.io.to(user.room).emit('message', formatMessage(user.username, msg,img));
    let  chatMessage  =  new Chat({ message: msg, userId: user.userId,roomId:user.roomId,username:user.username});
  chatMessage.save();
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      req.io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`,img)
      );

      // Send users and room info
      req.io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
  res.render("chat")
})

router.get("/upload", async (req,res)=>
{
    res.render("upload",{layout:'main'})
    
})
router.post("/", async (req,res)=>
{
    //req.body.user = req.user.id
    //req.body.img="https://journalr.s3.ap-south-1.amazonaws.com/"+key
    //await Entries.create(req.body)
    //res.render("entries",{layout:"dashboard"})
    console.log(req.body.User)
    
})
module.exports = router
