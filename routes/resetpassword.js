const express= require('express');

const router=express.Router();
const resetController=require('../controllers/resetpassword');

router.post('/getOtp',resetController.reset);
router.post('/verifyOtp/:id',resetController.verifyOtp);
router.put('/changePassword/:id',resetController.changePassword);
module.exports=router;
