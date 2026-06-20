const express=require('express');const router=express.Router();const fs=require('fs');const path=require('path');const DB_PATH=path.join(__dirname,'../../data/database.json');
function loadDB(){try{if(fs.existsSync(DB_PATH))return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch(e){}return{products:[]};}
function saveDB(data){const dir=path.dirname(DB_PATH);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));}
router.post('/',(req,res)=>{const{name,price,stock,description}=req.body;const db=loadDB();if(!name||!price)return res.status(400).json({error:'Nama dan harga wajib'});const product={id:Date.now().toString(),name,price:parseFloat(price),stock:parseInt(stock)||0,description:description||'',createdAt:new Date().toISOString()};if(!db.products)db.products=[];db.products.push(product);saveDB(db);res.json({success:true,product});});
router.get('/',(req,res)=>{const db=loadDB();res.json(db.products||[]);});
router.delete('/:id',(req,res)=>{const{id}=req.params;const db=loadDB();db.products=db.products.filter(p=>p.id!==id);saveDB(db);res.json({success:true,message:'Produk dihapus'});});
module.exports=router;
