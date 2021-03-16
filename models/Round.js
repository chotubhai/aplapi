const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const  roundSchema  =  new Schema({
        playerId: {
            type: String
        },
        auctionId: {
            type: String
        },
        roundNumber: {
            type: Number,
        },
        roundStatus: {
            enum: ["new","completed"],
            type: String
        },
        startTime:{
            type: Date,
            default: Date.now
        },
        bids:{
            type: Array,
            default:[]
        },
        highestBid:{
            type: Number,
            default: 0
        },
        highestBidder:{
            type: String,
            default: null
        }
    });

let  Round  =  mongoose.model("Round", roundSchema);
module.exports  =  Round;