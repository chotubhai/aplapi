const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bidderSchema = new Schema(
  {
    userId: {
      type: String
    },
    bidderName: {
      type: String
    },
    playerList: {
      type: Array,
      default: []
    },
    bidIdList: {
      type: Array,
      default: []
    },
    walletBalance: {
      type: Number,
      default: null 
    },
    roomId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

let Bidder = mongoose.model("Bidder", bidderSchema);
module.exports = Bidder;
