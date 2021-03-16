
 const User=require('../models/User');
 const mail=require('../models/resetSchema');
 const sgMail = require('@sendgrid/mail')
 //const mail=require('../controllers/resetpassword');
 
 var otpGenerator = require('otp-generator')
  
 let otp=otpGenerator.generate(6, { upperCase: false, specialChars: false });
 sgMail.setApiKey("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");
 module.exports.reset= async function(req,res){
     var email=req.body.email;
     var user = await User.findOne({email: email});
     
     if(user){
        const msg = {
            to: email,
            from: 'noreply@fivefalcon.com' ,// Use the email address or domain you ver.comified above
            subject: 'Password reset mail',
            text: 'Thvhfgc hcc yytf ukuy ',
            html: `<h2>YOUR OTP IS ${otp}</h2>`,
          };
          //ES6
          sgMail
            .send(msg)
            .then(() => {}, error => {
              console.error(error);
          
              if (error.response) {
                console.error(error.response.body)
              }
            });
            let otp1=new mail({visitor_email:req.body.email,generated_otp:otp, isVerified: false});
            await otp1.save();
            res.send({statusCode: 200, id: otp1._id});
     }

     else{
         res.send({message: 'User not found', statusCode: 401 })
     }
    
 };

 module.exports.verifyOtp=async function(req,res){
    let otp = await mail.findById(req.params.id);
    if(otp.generated_otp==req.body.otp){
 
        otp.isVerified = true
        await otp.save()
        res.send({isVerified:true});
    }
    else {
        res.send({isVerified:false});
    }

 };
 //save kro 
 module.exports.changePassword= async function(req,res){
    let otp = await mail.findById(req.params.id);
    let email = otp.visitor_email;
    let user = await User.findOne({email: email}); 
    if(user && otp.isVerified){
        user.password = req.body.password;
        await user.save();
        res.send({statusCode: 200, message:"Passowrd changed succesfully"});
    }
    else{
        res.send({message: 'User does not exist', statusCode: 401 });
    }


 };
 