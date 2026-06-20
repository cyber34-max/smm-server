const express=require('express');const router=express.Router();
router.get('/stats',(req,res)=>{res.json({members:750,online:65,posts:18400});});
module.exports=router;
