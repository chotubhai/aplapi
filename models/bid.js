const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const  bidSchema  =  new Schema(
    {
    bidderId: {
        type: String
    },
    amount:{
        type:Number
    },
    playerId:{
        type: String
    },
    startTime:{
        type: Date,
        default: Date.now,
    },
    bidStatus:{
        type:String
    },
    auctionId:{
        type:String
    }
    
},
        {
    timestamps: true
});

let  bid  =  mongoose.model("bid", bidSchema);
module.exports  =  bid;