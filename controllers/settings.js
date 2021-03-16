const User=require('../models/User');
module.exports.update= async function(req,res){
    let user = await User.findOne(req.params.id); 
    if(user){
        
        let newemail=User.findOne({email:req.body.email});
        if(newemail){
            return res.send({message:"email already exists"});
        } 
        else{
            user.email=req.body.email;
        }
       
        let newusername=User.findOne({username:req.body.username});
        if(newusername){
            return res.status(400).json({message:"username already exists"});
        } 
        else{
            user.username=req.body.username;
        }
        user.password=req.body.password;
        user.firstname=req.body.firstname;
        user.lastname=req.body.lastname;
        user.save();
        return res.send.status(200).json({message:"user successfully updated"});
    }
    else{
        return res.send.status(404).json({message:"user doesnt exist"});
    }
};
module.exports.deleteAccount=async function(req,res){
    let user = await User.findOne(req.params.id); 
    if(user){
        user.remove();
        return res.send.status(200).json({message:"user successfully removed"});
    }
    else{
        return res.send.status(404).json({message:"user doesnt exist"});
    }
}