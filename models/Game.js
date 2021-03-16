var mongoose=require('mongoose');


///player details


const gameSchema=mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        maxlength: 100
    },
    lastname:{
        type: String,
        required: true,
        maxlength: 100
    },
    username:
    {
        type:String,
        default:"khelAuction"
    },
    email:{
        type: String,
        required: true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required: false,
        minlength:8
    },
    password2:{
        type:String,
        required: false,
        minlength:8

    },
    avatar:{
        type:String,
        required:false,
        default:"http"

    },
    token:{
        type: String
    },
    phone:
    {
        type:String,
        required:false,
        default:"00000000000"
    },
    googleId: {
        type: String,
        required: true,
      },
    balance:
    {
        type:String,
        required:false,
        default:"0"
    },
    winnings:
    {
        type:String,
        required:false
    },
    winList:
    {
        type:String,
        required:false,
        default:""
    },
    roomList:
    {
        type:String,
        required:false,
        default:"",
    },
    achievements:
    {
        type:String,
        required:false,
        default:""
    },
    rank:
    {
        type:String,
        required:false,
        default:"0"
    }
});












module.exports=mongoose.model('Game',gameSchema);