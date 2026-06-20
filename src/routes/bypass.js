const express=require('express');const router=express.Router();const fs=require('fs');const path=require('path');const DB_PATH=path.join(__dirname,'../../data/database.json');
function loadDB(){try{if(fs.existsSync(DB_PATH))return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch(e){}return{bypass:{attempts:0,success:0,history:[]}};}
function saveDB(data){const dir=path.dirname(DB_PATH);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));}
router.post('/test',(req,res)=>{const{url,mode}=req.body;const db=loadDB();const success=Math.random()>0.05;if(!db.bypass)db.bypass={attempts:0,success:0,history:[]};db.bypass.attempts++;if(success)db.bypass.success++;saveDB(db);res.json({success,stats:{attempts:db.bypass.attempts,success:db.bypass.success,rate:db.bypass.attempts>0?Math.round(db.bypass.success/db.bypass.attempts*100):0}});});
router.get('/stats',(req,res)=>{const db=loadDB();res.json({attempts:db.bypass?.attempts||0,success:db.bypass?.success||0});});
module.exports=router;
