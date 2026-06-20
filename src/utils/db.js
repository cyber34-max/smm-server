const fs=require('fs');const path=require('path');const DB_PATH=path.join(__dirname,'../../data/database.json');
function loadDB(){try{if(fs.existsSync(DB_PATH))return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch(e){}return{users:[],schedules:[],faucet:{claims:0,earned:0,history:[]},products:[],campaigns:[],bypass:{attempts:0,success:0,history:[]}};}
function saveDB(data){const dir=path.dirname(DB_PATH);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));}
module.exports={loadDB,saveDB};
