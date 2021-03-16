const express= require('express');

const router=express.Router();
const settingsController=require('../controllers/settings');

router.post('/delete',settingsController.deleteAccount);

router.put('/update',settingsController.update);
module.exports=router;