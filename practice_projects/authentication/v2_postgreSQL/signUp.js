const express = require("express");
const router = express.Router();
const {sendEmail, emailTextUtils} = require("./js/sendEmail");
const dbUtils = require("./js/dbUtils");
const {passwordUtils, jwtTokenUtils } = require("./js/utils");
const {checkPassword, checkEmail} = require("./middleware/authMW");


async function insertUserInDb(userEmail, userPassword, userSalt) {
  try {
    const userPool = await dbUtils.dbConnect.userPool;

    const sql = `INSERT INTO users (
      user_email, 
      user_hashed_password, 
      user_salt,
      email_sent_time
    )
    VALUES($1, $2, $3, CURRENT_TIMESTAMP) 
    RETURNING user_id`;

    const userHashedPassword = await passwordUtils.hashedGenerator(userPassword, userSalt);

    const {rows} = await userPool.query(sql, [userEmail, userHashedPassword, userSalt]);
    
    return rows[0].user_id;
}catch(err){
    throw new Error(err);
}}
          



async function addUserInDb(req, res, next) {
  const { userEmail, userPassword } = req.body;

  try {
    const userSalt = await passwordUtils.saltGenerator();

    const userId = await insertUserInDb(userEmail,  userPassword, userSalt);


    req.user = {
      userId: userId,
      userEmail: userEmail
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function sendEmailToUser(req, res, next) {
  try {
    //token generation
    const emailToken = await jwtTokenUtils.jwtSign(
      {
        userId: req.user.userId,
        userEmail: req.user.userEmail,
        userEmailVerified: false,
        expiresIn: '24h',
        forCheckEmail: true
      }
    );
    sendEmail(
      req.user.userEmail,
      emailTextUtils.signUpEmail(emailToken)
    );
    
  
    next()
  } catch (err) {
    next(err);
  }
}

async function sendTokenToUser(req, res, next){
  try{
      const token = await jwtTokenUtils.jwtSign(
        {
          userId: req.user.userId,
          userEmail: req.user.userEmail,
          expiresIn: '24h',
        }
      );
      res
      .status(200)
      .json({
        token: token,
        message:
          "Thank you for registering, a confirmation email has been sent to your email address.",
      });
  }catch(err){
      next(err)
  }  
}

module.exports = router;


router.post("/signup",
checkPassword, 
checkEmail, 
addUserInDb, 
sendEmailToUser,
sendTokenToUser);
module.exports = router;



