const Bid = require("../models/bid");
const Bidder = require("../models/bidder");
const Room = require("../models/Room");
const User = require("../models/User");
const axios = require("axios");

async function createBidder(roomId, userId) {
  let room = await Room.findById(roomId);
  console.log(room);
  let bidder = new Bidder({
    roomId,
    userId,
    walletBalance: room.entryMoney,
  });
  bidder.save();
  console.log(bidder);
  return bidder;
}
const buyPlayer = async (roomId, playerId, bidderId, amount) => {
  if (bidderId) {
    let bidder = await Bidder.findById(bidderId);
    bidder.walletBalance = bidder.walletBalance - amount;
    bidder.playerList = [...bidder.playerList, playerId];
    let room = await Room.findById(roomId);
    room.Auction.playerAssigned = [
      ...room.Auction.playerAssigned,
      { pid: playerId.pid, bidderId },
    ];
    // room.Auction.playerRemainings.splice(room.Auction.playerRemainings.indexOf(playerId), 1)
    await bidder.save();
    await room.save();
  }
  console.log("PLAYER NOT SOLD");
};
const fetchPlayerDetails = async (pid) => {
  var player = {};
  axios
    .post("https://cricapi.com/api/playerStats", {
      apikey: "lTnE4tXFYcQdK1eADdrmAaNi82A3",
      pid,
    })
    .then((res) => {
      player = res.data;
    });
  return player;
};

function auctionRes(obj, msg) {
  return {
    obj,
    message: msg,
  };
}

const bidderInfo = async (bId) => {
  let bidder = {};
  bidder = await Bidder.findById(bId);
  return bidder;
};
// async function deleteBids(auctionid){
//     const bids = Bid.find({auctionId})
//     for(let i = 0; i< bids.length; i++){
//         let bidId = bids[i]._id
//         let bid = bidders.findById(bidId)
//         bid.remove()
//     }
// }
// async function deleteRounds(auctionid){
//     const round = Round.find({auctionId})
//     for(i = 0; i< round.length; i++){
//         let roundId = round[i]._id
//         let round = bidders.findById(roundId)
//         round.remove()
//     }
// }

const fetchMatchList = async () => {
  let m;
  await axios
    .post("https://cricapi.com/api/matches", {
      apikey: "lTnE4tXFYcQdK1eADdrmAaNi82A3",
    })
    .then((response) => {
      m = response["data"].matches;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
  return m;
};

const fetchSquads = async (id) => {
  let players = [];
  await axios
    .post("https://cricapi.com/api/fantasySquad", {
      unique_id: id,
      apikey: "lTnE4tXFYcQdK1eADdrmAaNi82A3",
    })
    .then((res) => {
      players = res["data"]["squad"][0]["players"].concat(
        res["data"]["squad"][1]["players"]
      );
    })
    .catch((error) => {
      console.error(error);
    });
  return players;
};
module.exports = {
  createBidder,
  // deleteBids,
  // deleteRounds,
  auctionRes,
  fetchSquads,
  bidderInfo,
  buyPlayer,
  fetchMatchList,
  fetchPlayerDetails,
};
