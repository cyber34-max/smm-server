const express=require('express');const router=express.Router();const fs=require('fs');const path=require('path');const DB_PATH=path.join(__dirname,'../../data/database.json');
function loadDB(){try{if(fs.existsSync(DB_PATH))return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch(e){}return{schedules:[]};}
function saveDB(data){const dir=path.dirname(DB_PATH);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));}
router.post('/',(req,res)=>{const{platform,content,time,hashtags}=req.body;const db=loadDB();if(!content||!time)return res.status(400).json({error:'Konten dan waktu wajib'});const schedule={id:Date.now().toString(),platform:platform||'tiktok',content,time,hashtags:hashtags||'#fyp',status:'scheduled',createdAt:new Date().toISOString()};if(!db.schedules)db.schedules=[];db.schedules.push(schedule);saveDB(db);res.json({success:true,schedule});});
router.get('/',(req,res)=>{const db=loadDB();res.json(db.schedules||[]);});
router.delete('/:id',(req,res)=>{const{id}=req.params;const db=loadDB();db.schedules=db.schedules.filter(s=>s.id!==id);saveDB(db);res.json({success:true,message:'Schedule dihapus'});});
module.exports=router;
