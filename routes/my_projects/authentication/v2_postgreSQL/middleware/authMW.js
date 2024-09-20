const utils = require('../js/utils');
const {jwtTokenUtils} = utils;
const {checkReqUtils} = utils;

async function decodedToken(req, res, next) {
    const authHeader = req.headers.authorization;
    try {
       const token = checkReqUtils.authHeaderCheck(authHeader);
       const decoded = await jwtTokenUtils.jwtVerify(token,false);
       req.body.decoded = decoded;
       console.log('decoded',decoded);
       next();
        

    } catch(err){
        next(err)
    }
} 

function checkTableType(req, res, next){
    if(["bg_video"].includes(req.body.type)){
        next()
    }else{
        next (new Error('table is not defined'));
    }
}


function checkEmailVerified(req, res, next){
    const {userEmailVerified} = req.body.decoded;
    if(userEmailVerified){
        next()
    }else{
        next(new Error('Email not verified'))
    }
}
function checkPassword(req, res, next) {
    try {
            checkReqUtils.checkPassword(req.body.userPassword);  
            next();
        }catch(err){
            next(err);
        }
}

function checkEmail(req, res, next) {
    try{
           checkReqUtils.checkEmail(req.body.userEmail);  
           next();
       }catch(err){
           next(err);
       }
}

    

module.exports = {
    checkTableType,
    decodedToken,
    checkEmailVerified,
    checkPassword,
    checkEmail
}