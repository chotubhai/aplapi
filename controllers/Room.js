const { request } = require('express');
const Room = require('../models/Room')
const User = require('../models/User')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey("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");
async function generateRoomCode (){
    let length = 4;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
// const verifyRoomCode = async(roomCode) => {
//     let room = await Room.find({roomCode})
//     if(room){
//         roomCode = await generateRoomCode()
//         await verifyRoomCode(roomCode)
//     }
//     return roomCode
// }
const createRoom = async(req, res, next) => {
    let {name, image, description, createdBy,type, limit, entryMoney} = req.body
    let roomcode = await generateRoomCode()
    let roomCode=name.slice(0,4)+roomcode
    //roomCode = await verifyRoomCode(roomCode)
    let room = new Room({
        name,
        type, 
        image,
        roomCode,
        description, 
        createdBy,
        limit,
        entryMoney,
        users: [],
        userQueue: []
    })
    try{
        await room.save()
    } catch (err){
        console.log(err)
        return next(err)
    }
    res.status(201).json({room, message:"Room Created"})
}

const fetchRooms = async (req, res, next) => {
    let rooms
    try{
        rooms = await Room.find({type:'public'})
    } catch(err){
        console.log(err)
        return next(err)
    }
    res.status(200).json({rooms})
}

const fetchRoomById = async (req, res, next) => {
    let room
    try{
        room = await Room.findById(req.params.id)
    } catch(err){
        console.log(err)
        return next(err)
    }
    res.status(200).json({room})
}
const fetchRoomByCode = async (req,res,next) => {
    let room 
    try{
        room = await Room.findOne({roomCode: req.body.roomCode})
    } catch(err){
        console.log(err)
        return next(err)
    }
    res.status(200).json({room})
}
const fetchRoomsByUid = async (req, res,next) => {
    let rooms
    try{
        rooms = room.find({createdBy : req.params.uid})
    }
    catch(err){
        console.log(err)
        return next(err)
    }
    res.status(200).json({rooms})
}
const joinRoom = async (req, res, next) => {
    let room, user
    try{ 
         user = await User.findById(req.body.uid)
        room = await  Room.findById(req.params.id)
         console.log(user.walletBalance, room.entryMoney)
         if(user.walletBalance >= room.entryMoney){
            //call payment api 
            user.walletBalance = user.walletBalance - room.entryMoney 
            user.roomList = [...user.roomList, room._id]
            let userObj = {
                username: user.username,  
                avatar: user.avatar,
                uid: req.body.uid,
                firstname: user.firstname
            }
            room.users = [...room.users, userObj]
            
            await user.save()
            await room.save()
        }
        else{
            return res.status(400).json({message: 'Not enough credit in your wallet'})
        }
    } catch(err) {
        console.log(err)
        return next(err)
    }
    res.status(201).json({room, user, message: 'User added to the room'})
}
const inviteUser = async (req, res, next) => {
    let room 
    try{
        room = await Room.findById(req.params.id)
        let user = await User.findById(room.createdBy)
        let inviteduser=await User.findOne({username:req.body.username})
        let roomCode = room.roomCode
        const msg = {
            to: inviteduser.email,
            from: 'noreply@fivefalcon.com' ,// Use the email address or domain you ver.comified above
            subject: `Room Invite By ${user.username}`,
            text: `You have been invited to a join a room created by ${user.username}`,
            html: `<p>Room Code for joining the room in <strong>${roomCode}</strong></p>`,
          }
        sgMail
        .send(msg)
        .then(() => {}, error => {
        console.error(error);
    
            if (error.response) {
                console.error(error.response.body)
            }
            return next(err)
        });
    } catch(err){
        console.log(err)
        return next(err)
    }
    res.status(201).json({message: "Invite Sent"})
}

const kickUser = async (req, res, next) => {
    let room
    try{
        room = await Room.findById(req.params.id)
        if(room.users.indexOf(req.body.uid) === -1){
            return res.status(404).json('User not found')
        } else{
            room.users.splice(room.users.indexOf(req.body.uid), 1)
            await room.save()
        }
    }
    catch (err){
        console.log(err)
        return next(err)
    }
    res.status(201).json({room, message: 'User Removed'})
}
exports.inviteUser = inviteUser
exports.createRoom = createRoom
exports.fetchRooms = fetchRooms
exports.joinRoom = joinRoom
exports.fetchRoomById = fetchRoomById
exports.kickUser = kickUser
exports.fetchRoomsByUid = fetchRoomsByUid
exports.fetchRoomByCode = fetchRoomByCode