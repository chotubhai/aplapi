const Room = require("../models/Room");
const Auction = require("../models/Auction");
const Bidder = require("../models/bidder");
const Bid = require("../models/bid");
const Round = require("../models/Round");
const User = require("../models/User");
const helpers = require("../utils/auctionUtils");
const redis = require("redis");
const client = redis.createClient(6379, "35.222.176.78");

const createAuction = async (req, res, next) => {
  const { roomId, matchId } = req.body;
  let players = [];
  let room = await Room.findById(roomId);
  //   let auction = new Auction({ roomId, matchId });
  try {
    // await auction.save();
    // room.Auction.auctionStatus = "CREATED"
    players = await helpers.fetchSquads(matchId);
    room.Auction.playerRemainings = players;
    room.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.status(200).json({ message: "Auction Created", room });
};
 
const auctionSocket = (req, res) => {
  console.log('yay')
  req.io.on("connection", (socket) => {
    console.log("client connected")
    socket.on("startAuction", async ({ roomId, bidderId }) => {
      const roomObj = await Room.findById(roomId);
      const playerId = roomObj.playerRemainings[roomObj.currentRound];
      
      client.set(roomId, { currentRound: {currentBidder: null,playerId:playerId}, highestBid: 0 });

      setInterval(async () => {

        const currentRound = JSON.parse(client.get(roomId)).currentRound;
        //params roomid playerId bidderId, and bid amt
        setTimeout(() => helpers.buyPlayer(roomId,currentRound.playerId,currentRound.currentBidder,currentRound.highestBid), 15000)

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
};
// const createRound = async (req, res,next) => {
//     const {playerId, auctionId, roundNumber} = req.body
//     let round = new Round({
//         playerId,
//         roundNumber: roundNumber,
//         roundStatus: 'new',
//         auctionId
//     })
// }
// const placeBid = async (req, res, next) => {
//     const {bidderId, amount} = req.body
//     const {roundId} = req.params
//     const round = await Round.findById(roundId)
//     const bidder = await Bidder.findById(bidderId)
//     let bid = new Bid({
//         playerId,bidderId, amount,auctionId: round.auctionId,
//         status:"placed"
//     })
//     await bid.save()
//     bidder.bidIdList = [...bidder.bidIdList,bid._id ]
//     await bidder.save()
//     round.highestBidder = bidderId,
//     round.highestBid = amount
//     round.bids = [...round.bids, bid._id]
//     await round.save()
// }
// const roundOver = async (req,res, next) => {
//     const {roundId} = req.params
//     const round =await Room.findById(roundId)
//     const auction =await Auction.findById(round.auctionId)
//     const bid = Bid.findById(bidId)
//     if(round.highestBidder !== null){
//         bid.bidStatus = 'won'
//         const bidder = Bidder.findById(roundId.highestBidder)
//         bidder.playerList = [...bidder.playerList, round.playerId]
//         bidder.walletBalance = bidder.walletBalance - round.highestAmount
//         auction.playerRemainings.splice(auction.playerRemainings.indexOf(round.playerId), 1)
//         auction.playerAssigned = [...auction.playerAssigned, round.playerId]
//     }
//     round.roundStatus = 'over'

//     await auction.save()
//     await bidder.save()
//     await room.save()
//     await bid.save()
// }
const auctionOver = async (req, res, next) => {
  const { auctionId } = req.params;
  const auction = await Auction.findById(round.auctionId);
  helpers.deleteBids(auctionId);
  helpers.deleteRounds(auctionId);
};
exports.createAuction = createAuction;
exports.auctionSocket = auctionSocket;
