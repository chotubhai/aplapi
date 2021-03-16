const User=require('./../models/User');

let auth =(req,res,next)=>{
    let token =req.cookies.auth;
    console.log(token)
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({
            error :"log in failed   "
        });

        req.token= token;
        req.user=user;
        next();

    })
}
module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/')
      }
    },
    ensureGuest: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/dashboard');
      }
    },
  }
module.exports={auth};