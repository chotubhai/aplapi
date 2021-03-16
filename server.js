require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
// const io = socketio(server);
const mongoose = require("mongoose");
const path = require("path")
const helpers = require("./utils/auctionUtils");
const redis = require("redis");
const client = redis.createClient(6379, "35.222.176.78");
const Room = require("./models/Room");
const Auction = require("./models/Auction");
const Bidder = require("./models/bidder");
const Bid = require("./models/bid");
const connectDB = require("./config/db");
const Round = require("./models/Round");
const User = require("./models/User");

const io = new Server(server, { cors: { origin: "*" } });

// io.adapter(redisAdapter({host: 'localhost', port: 6379}))


  connectDB()
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "*");

  next();
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(allowCrossDomain);


// io.on("connect", (socket) => {
  
//   socket.on("join-room", ({roomId, userId}) => {
//     console.log("user connected room :"+ roomId + " userId"+userId)
//     socket.join(roomId);
//     socket.to(roomId).broadcast.emit("user-connected", userId);
//     socket.on("disconnect", () => {
//       socket.to(roomId).broadcast.emit("user-disconnected", userId);
//     });
//   });
// });
io.on("connection", (socket) => {
    // console.log("client connected")
    socket.on("startAuction", async ({ roomId, userId }) => {
      const roomObj = await Room.findById(roomId);
      const playerId = roomObj.playerRemainings[roomObj.currentRound];
      
      client.set(roomId, { currentRound: {currentBidder: null,playerId:playerId}, highestBid: 0 });

      setInterval(async () => {

        const currentRound = JSON.parse(client.get(roomId)).currentRound;
        //params roomid playerId bidderId, and bid amt
        helpers.buyPlayer(roomId,currentRound.playerId,currentRound.currentBidder,currentRound.highestBid);

          //start next round by cleaning prev. data
          const roomObj2 = await Room.findOneAndUpdate(roomId,{[Auction.currentRound]: roomObj.Auction.currentRound +1});
   client.set(roomId,JSON.stringify(JSON.parse(client.get(room).currentRound = {currentBidder: null,playerId: roomObj2.Auction.playerRemainings[roomObj2.Auction.currentRound - roomObj2.Auction.playerAssigned.length -1]} )))

   var playerObj2 = await helpers.fetchPlayerDetails(playerId);

   socket.broadcast.to(roomId).emit("new player", playerObj2);

      }, 20000);

      socket.join(roomId);
      const playerObj = await helpers.fetchPlayerDetails(playerId);

      socket.broadcast.to(roomId).emit("auction start", playerObj);
    });


    socket.on("join-room",async ({roomId,userId})=>{
      console.log(roomId)
    var bidderObj = await helpers.createBidder(roomId,userId);

    socket.join(roomId);
      socket.emit("userJoined",bidderObj);
    })

    socket.on("placebid", async ({ roomId, bidderId, bidAmt, playerId }) => {
      const highestBid = JSON.parse(client.get(roomId)).highestBid;

      if (bidAmt <= highestBid) {
        return;
      } else {
        client.set(
          roomId,
          JSON.stringify((JSON.parse(client.get(roomId)).highestBid = bidAmt))
        );

        socket.broadcast.to(roomId).emit("bidPlaced", {
          bidderInfo: await helpers.bidderInfo(bidderId),
          bidAmt: bidAmt
        });
      }
    });

    socket.on("fold", async ({ bidderId, roomId }) => {
      socket.broadcast
        .to(roomId)
        .emit("folded", { bidderInfo: await helpers.bidderInfo(bidderId) });
    });

    socket.on("leave", async ({ bidderId, roomId }) => {
      socket.leave(roomId);
      //rem
      socket.broadcast
        .to(roomId)
        .emit("leaved", { bidderInfo: await helpers.bidderInfo(bidderId) });
    });

    // call when somebody join room
    //     socket.on('joinAuction', async ({roomId, userId}) => {

    //         // client.set()
    //         const bidderObj = await Bidder.findById(bidderId)
    //         // const auctionObj = await Auction.findById(auctionId)

    // bidders = JSON.parse(client.get(roomId)).bidders;
    //  bidders = bidders ? [...bidders , {bidderId,walletBalance :bidderObj.walletBalance}]: [{bidderId,walletBalance :bidderObj.walletBalance}];
    //         client.set(roomId,JSON.stringify({
    //            bidders
    //         }))

    //         let bidder = await helpers.createBidders(roomId,userId)

    //         socket.join(roomId)
    //         socket.broadcast.to.emit('auctionJoined',bidder )

    //         // socket.broadcast
    //         // .to(bidder.auction)
    //         // .emit(
    //         //     'auctionRes',
    //         //     "auction joined"
    //         // );
    //     })

    // socket.on('placeBid',async ({bidderId, amount, roundId}) => {
    //     const round = await Round.findById(roundId)
    //     const bidder = await Bidder.findById(bidderId)
    //     let bid = new Bid({
    //         playerId,bidderId, amount,auctionId: bidder.auction,
    //         status:"placed"
    //     })
    //     await bid.save()
    //     bidder.bidIdList = [...bidder.bidIdList,bid._id ]
    //     await bidder.save()
    //     round.highestBidder = bidderId,
    //     round.highestBid = amount
    //     round.bids = [...round.bids, bid._id]
    //     await round.save()
    //     socket.broadcast.to(bidder.auction).emit('auctionRes', auctionRes(bid,"Bid Placed"))
    // })
    // socket.on('roundOver', async ({roundId})=>{
    //     const round =await Room.findById(roundId)
    //     const auction =await Auction.findById(round.auctionId)
    //     const bid = Bid.findById(bidId)
    //     if(round.highestBidder !== null){
    //         bid.bidStatus = 'won'
    //         const bidder = Bidder.findById(roundId.highestBidder)
    //         bidder.playerList = [...bidder.playerList, round.playerId]
    //         bidder.walletBalance = bidder.walletBalance - round.highestAmount
    //         await bidder.save()
    //         auction.playerRemainings.splice(auction.playerRemainings.indexOf(round.playerId), 1)
    //         auction.playerAssigned = [...auction.playerAssigned, round.playerId]
    //     }
    //     round.roundStatus = 'over'
    //     await round.save()
    //     await auction.save()
    //     await room.save()
    //     await bid.save()
    //     socket.broadcast.to(bidder.auction).emit('auctionRes', auctionRes(round,"Round Over"))
    //     })

    // socket.on('fold',async ({})=>{

    // })

    // socket.on('startRound',async ({auctionObj, playerId}) =>{
    //     const auctionObj = await Auction.findById(auctionObj._id)
    //     let round = new Round({
    //         playerId,
    //         roundNumber: auctionObj.currentRound +1,
    //         roundStatus: 'new',
    //         auctionId: auctionObj._id
    //     })
    // await round.save()
    // socket.broadcast.to(bidder.auction).emit('auctionRes', auctionRes(round, `Round ${round.roundNumber}`))

    // })
  });
app.get("*",(req,res)=>{
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
})

let PORT = 8000
server.listen(PORT, () => {
  console.log("server started");
});
