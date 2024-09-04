const {jwtTokenUtils, randomGenerators,checkReqUtils} = require('../utils/utils');

const {sendEmail, emailTextUtils} = require("../utils/sendEmail");

async function decodedToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
       const token = checkReqUtils.authHeaderCheck(authHeader);
       const decoded = await jwtTokenUtils.jwtVerify(token,false);
       
       if(decoded.block){
            throw new Error('Your account was blocked');
       }

       req.user = decoded;
       next();
    } catch(err){
        next(err);
    }
}
        



async function sendKeyToUserEmailAndStorage(req, res, next) {
    try {
      const randomNumbers = randomGenerators.sixNumbers();
      const {userId, userEmail} = req.user;
      const creationDate = Date.now();
  
      keyStorage.set(randomNumbers + '',{userId, userEmail, creationDate});
  
      console.log("keyStorage",keyStorage);
      sendEmail(
        req.user.userEmail,
        emailTextUtils.sendKeyToEmail(randomNumbers)
      );
      next()
    }catch(err){
      next(err);
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
    checkEmail,
    sendKeyToUserEmailAndStorage,

}