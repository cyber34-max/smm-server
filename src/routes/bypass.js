const express=require('express');const router=express.Router();const{loadDB,saveDB}=require('../utils/db');
router.post('/test',(req,res)=>{const{url,mode}=req.body;const db=loadDB();const success=Math.random()>0.05;if(!db.bypass)db.bypass={attempts:0,success:0,history:[]};db.bypass.attempts++;if(success)db.bypass.success++;saveDB(db);res.json({success,stats:{attempts:db.bypass.attempts,success:db.bypass.success,rate:db.bypass.attempts>0?Math.round(db.bypass.success/db.bypass.attempts*100):0}});});
router.get('/stats',(req,res)=>{const db=loadDB();res.json({attempts:db.bypass?.attempts||0,success:db.bypass?.success||0});});
module.exports=router;
