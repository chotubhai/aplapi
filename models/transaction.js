const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const  transactionSchema  =  new Schema(
    {
    transactionname: {
    type: String
    },
    userid:{
        type:String
    },
    amount:{
        type: Boolean
    },
    transactiondate:{
        type:Date,
        default:Date.now
    }
    
    
},
        {
    timestamps: true
});

let  transaction  =  mongoose.model("transaction", transactionSchema);
module.exports  =  transaction;