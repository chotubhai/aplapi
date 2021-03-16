const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  roomCode: {
    type: String,
    required: false
  },
  limit: {
    type: Number,
    required: true
  },
  users: {
    type: Array,
    required: false
  },
  entryMoney: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  Auction: {
    biddersList: {
      type: Array,
      required: false,
      default: []
    },
    playerRemainings: {
      type: Array,
      required: false,
      default: []
    },

//{playerID, userId : who won this player}
    playerAssigned: {
      type: Array,
      required: false,
      default: []
    },
    currentRound: {
      type: Number,
      default: 0
    },
    currentBidder: {
      type: String,
      required: false,
      default: ""
    },
    auctionStatus: {
      type: String,
      required: false,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    }, 
    winnerId: {
      type: String,
      required: false,
      default: ""
    },

    //[{current bid ,current bidder: _id, playerID: _id,}]
    // roundInfo: {
    //     type: Array,
    //     required:true
    // }
  }
});

module.exports = mongoose.model("Room", RoomSchema);
