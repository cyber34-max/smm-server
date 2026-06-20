const express=require('express');const router=express.Router();const{loadDB,saveDB}=require('../utils/db');
router.post('/',(req,res)=>{const{name,budget,platform,target}=req.body;const db=loadDB();if(!name||!budget)return res.status(400).json({error:'Nama dan budget wajib'});const campaign={id:Date.now().toString(),name,budget:parseFloat(budget),platform:platform||'tiktok',target:target||'engagement',status:'active',createdAt:new Date().toISOString()};if(!db.campaigns)db.campaigns=[];db.campaigns.push(campaign);saveDB(db);res.json({success:true,campaign});});
router.get('/',(req,res)=>{const db=loadDB();res.json(db.campaigns||[]);});
router.delete('/:id',(req,res)=>{const{id}=req.params;const db=loadDB();db.campaigns=db.campaigns.filter(c=>c.id!==id);saveDB(db);res.json({success:true,message:'Campaign dihapus'});});
module.exports=router;
