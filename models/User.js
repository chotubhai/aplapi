var mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const config=process.env.NODE_ENV;
const salt=10;
var randomWords = require('random-words');

const userSchema=mongoose.Schema({
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
        required: false,
      },
    walletBalance:
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
        type:Array,
        required:false,
        default:[]
    },
    roomList:
    {
        type:Array,
        required:false,
        default:[],
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

 
userSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

userSchema.methods.comparepassword=function(password,cb,next){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}
userSchema.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),"79d96892-4d71-4d0d-be2a-56d3fea1fa3f");

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

userSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,"79d96892-4d71-4d0d-be2a-56d3fea1fa3f",function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};
userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

module.exports=mongoose.model('User',userSchema);