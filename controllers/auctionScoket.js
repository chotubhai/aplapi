const Room = require("../models/Room");
const Auction = require("../models/Auction");
const Bidder = require("../models/bidder");
const Bid = require("../models/bid");
const Round = require("../models/Round");
const User = require("../models/User");
const helpers = require("../utils/auctionUtils");
const redis = require("async-redis");
const client = redis.createClient(6379, "35.222.176.78");

const auctionSocket = (io) => {
  console.log("yay");
  io.of("/auction").on("connection", (socket) => {
    console.log("client connected");
    socket.on("startAuction", async ({ roomId, userId }) => {
      const roomObj = await Room.findById(roomId);

      const playerId =
        roomObj.Auction.playerRemainings[roomObj.Auction.currentRound];

      await client.set(
        roomId,
        JSON.stringify({
          currentRound: { currentBidder: null, playerId: playerId },
          highestBid: 0,
        })
      );

     var interval = setInterval(async () => {
        const currentRound = JSON.parse(await client.get(roomId)).currentRound;
        // console.log(await client.get(roomId));
        //params roomid playerId bidderId, and bid amt
        // setTimeout(()=> {

        if(roomObj.Auction.currentRound > roomObj.Auction.playerRemainings.length){
          clearInterval(interval);
          socket.emit("auction ended");
        }

        console.log(" log: " + JSON.stringify(currentRound));
        helpers.buyPlayer(
          roomId,
          currentRound.playerId,
          currentRound.currentBidder,
          currentRound.highestBid
        );
        // }, 15000)

        //start next round by cleaning prev. data
        // const roomObj2 = await Room.findOneAndUpdate(roomId, {
        //   $set: {
        //     [Auction.currentRound]: roomObj.Auction.currentRound + 1,
        //   },
        // });

        roomObj.Auction.currentRound += 1;
        roomObj.save();

        console.log(" log2: " + JSON.stringify(roomObj));

        const _roomObj = JSON.parse(await client.get(roomId));
        _roomObj.currentRound = {
          currentBidder: null,
          playerId:
            roomObj.Auction.playerRemainings[roomObj.Auction.currentRound],
        };

        await client.set(roomId, JSON.stringify(_roomObj));

        var playerObj2 = await helpers.fetchPlayerDetails(playerId);

        socket.broadcast.to(roomId).emit("new player", playerObj2);
      }, 2000);

      socket.join(roomId);
      const playerObj = await helpers.fetchPlayerDetails(playerId);

      socket.broadcast.to(roomId).emit("auction start", playerObj);
    });

    socket.on("join-room", async ({ roomId, userId }) => {
      console.log(roomId);
      var bidderObj = await helpers.createBidder(roomId, userId);

      socket.join(roomId);
      socket.emit("userJoined", bidderObj);
    });

    socket.on("placebid", async ({ roomId, bidderId, bidAmt, playerId }) => {
      const highestBid = JSON.parse(await client.get(roomId)).highestBid;

      if (bidAmt <= highestBid) {
        return;
      } else {
        await client.set(
          roomId,
          JSON.stringify(
            (JSON.parse(await client.get(roomId)).highestBid = bidAmt)
          )
        );

        socket.broadcast.to(roomId).emit("bidPlaced", {
          bidderInfo: await helpers.bidderInfo(bidderId),
          bidAmt: bidAmt,
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

    //         // await client.set()
    //         const bidderObj = await Bidder.findById(bidderId)
    //         // const auctionObj = await Auction.findById(auctionId)

    // bidders = JSON.parse(await client.get(roomId)).bidders;
    //  bidders = bidders ? [...bidders , {bidderId,walletBalance :bidderObj.walletBalance}]: [{bidderId,walletBalance :bidderObj.walletBalance}];
    //         await client.set(roomId,JSON.stringify({
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

module.exports = auctionSocket;
