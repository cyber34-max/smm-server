const IP_POOL=['192.168.1.1','192.168.1.2','192.168.1.3','192.168.1.4','192.168.1.5'];function getIP(){return IP_POOL[Math.floor(Math.random()*IP_POOL.length)];}function getPoolStats(){return{total:IP_POOL.length,used:0};}
module.exports={getIP,getPoolStats};
