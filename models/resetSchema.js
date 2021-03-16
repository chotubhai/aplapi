const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const  otpSchema  =  new Schema(
    {
    visitor_email: {
    type: String
    },
    generated_otp:{
        type:String
    },
    isVerified:{
        type: Boolean
    }
    
    
},
        {
    timestamps: true
});

let  Otp  =  mongoose.model("Otp", otpSchema);
module.exports  =  Otp;