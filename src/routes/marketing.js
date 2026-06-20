const express=require('express');const router=express.Router();const fs=require('fs');const path=require('path');const DB_PATH=path.join(__dirname,'../../data/database.json');
function loadDB(){try{if(fs.existsSync(DB_PATH))return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch(e){}return{campaigns:[]};}
function saveDB(data){const dir=path.dirname(DB_PATH);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));}
router.post('/',(req,res)=>{const{name,budget,platform,target}=req.body;const db=loadDB();if(!name||!budget)return res.status(400).json({error:'Nama dan budget wajib'});const campaign={id:Date.now().toString(),name,budget:parseFloat(budget),platform:platform||'tiktok',target:target||'engagement',status:'active',createdAt:new Date().toISOString()};if(!db.campaigns)db.campaigns=[];db.campaigns.push(campaign);saveDB(db);res.json({success:true,campaign});});
router.get('/',(req,res)=>{const db=loadDB();res.json(db.campaigns||[]);});
router.delete('/:id',(req,res)=>{const{id}=req.params;const db=loadDB();db.campaigns=db.campaigns.filter(c=>c.id!==id);saveDB(db);res.json({success:true,message:'Campaign dihapus'});});
module.exports=router;
