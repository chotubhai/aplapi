

const mongoose = require('mongoose')
const AuctionSchema = new mongoose.Schema({
    biddersList: {
        type: Array,
        required: false,
        default: []
    },
    playerRemainings: {
        type:Array,
        required: false,
        default: []
    },
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
        default: ''
    },
    auctionStatus:{
        type: String,

        required: false,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    roomId:{
        type: String,
        required: true
    },
    winnerId: {
        type: String,
        required: false,
        default: ''
    }
})

module.exports = mongoose.model('Auction', AuctionSchema)