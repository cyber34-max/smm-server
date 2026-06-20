const express=require('express');const router=express.Router();
router.get('/overview',(req,res)=>{res.json({followers:1500,engagement:'6.2%',revenue:2500000,chart:[60,45,80,70,95,50,65]});});
module.exports=router;
