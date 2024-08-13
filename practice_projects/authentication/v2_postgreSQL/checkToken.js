const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const key = 'key';


async function decodedToken(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = '';
    try {
        
        if(authHeader && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7);
        }else{
            throw new Error("Invalid token");
        }

        const decoded = jwt.verify(token, key, {ignoreExpiration: false},(err,decoded) => {
            if(err){
                throw new Error('Error decoded token');
            }else{
                return decoded
            }
        }); 

        req.decoded = decoded;
        next();

    } catch(err){
        res.status(401).json({ error: `Unauthorized: ${err.message}`});
    }

}  

function checkEmail(req, res, next){
        if(req.decoded.emailVerified){
            next()
        }else{
            res.status(401).json({error:'Email is not verified'})
        }
}
    

router.post('/check-token',decodedToken,checkEmail,(req, res, next) => {
    console.log(req.token);
});

router.post('/test',()=>{
    console.log(1111111)
})

module.exports = router;