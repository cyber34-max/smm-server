function antiLimit(req,res,next){req.headers['x-forwarded-for']='192.168.1.'+Math.floor(Math.random()*255);next();}
module.exports={antiLimit};
