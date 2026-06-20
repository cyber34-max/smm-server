const UA_POOL=['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36','Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1','Mozilla/5.0 (Android 13; Mobile; rv:109.0) Firefox/121.0'];function getRandomUA(){return UA_POOL[Math.floor(Math.random()*UA_POOL.length)];}
module.exports={getRandomUA};
