  
const transaction=require('../models/transaction');
const User=require('../models/User');

module.exports.fetchtransactionbyuid= async function(req,res){
    let transactions=transaction.find({userid:req.params.id});
    res.status(200).json({transactions});

}