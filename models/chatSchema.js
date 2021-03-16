const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const  chatSchema  =  new Schema(
    {
    message: {
    type: String
    },
    username:{
        type:String
    },
    
    roomId:{
        type:String
    },
    userId:{
        type:String
    }
},
        {
    timestamps: true
});

let  Chat  =  mongoose.model("Chat", chatSchema);
module.exports  =  Chat;