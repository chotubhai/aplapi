const express= require('express');

const router=express.Router();
const transactionController=require('../controllers/transaction');

router.get('/getTransactionsbyuid/:id',transactionController.fetchtransactionbyuid);

module.exports=router;