const express = require("express");
const router = express.Router();
const {checkPassword, checkEmail} = require("./middleware/authMW");
const {passwordUtils,jwtTokenUtils} = require("./utils/utils");



async function checkUserInMongoDb(req,res,next)  {
  try{
    const { userEmail, userPassword } = req.body;
    const mongoDb =  req.app.locals.mongoDb;
    const db = await mongoDb.mongoDbConnect;

    const user = await db.collection('users').findOne({ email: userEmail });
    
    if(!user){
      throw new Error('Incorrect username or password')
    }

    await passwordUtils.checkPassword(
      user.hash_password.buffer,
      userPassword, 
      user.salt.buffer
    );

    req.user = user;
    next();
  } catch (err) {
    next(err)
  }
}
  

async function sendToken(req, res, next) {
  try {
    const token = await jwtTokenUtils.jwtSign(
      {  
          userId: req.user._id,
          userEmail: req.user.email,
          userEmailVerified: req.user.verified,
          userBlock: req.user.block
      })
    //Send token
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

router.post("/v1/login",
checkPassword,
checkEmail,
checkUserInMongoDb,
sendToken
);

module.exports = router;



