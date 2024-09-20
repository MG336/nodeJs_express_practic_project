const express = require("express");
const router = express.Router();
const dbUtils = require("./js/dbUtils");
const {jwtTokenUtils} = require("./js/utils"); 

async function updateUserEmailVerifiedInDb(userId) {
  try {
    const client = await dbUtils.dbConnect.userPool;
    const query = `
          UPDATE users SET user_email_verified = ($1) WHERE user_email = $2
      `;
    await client.query(query, [true, userId]);
  }catch (err) {
    throw new Error(err);
  }
}

async function emailVerified(req, res, next){  
  const {emailToken} = req.body;
  
  try {
   
    const decodedEmailToken = await jwtTokenUtils.jwtVerify(emailToken, true);
    if(!decodedEmailToken.forCheckEmail){
      throw new Error("Invalid email token");
    }
    await updateUserEmailVerifiedInDb(decodedEmailToken.userId);
      req.decoded = decodedEmailToken;
      next()
  } catch (err) {
      next(err);
}}

async function updateToken(req, res, next) {
  const {userId,userEmail} = req.decoded;
  try {
    const newToken = await jwtTokenUtils.jwtSign(
      {
        userId: userId,
        userEmail: userEmail,
        userEmailVerified: true,
      }
    );
    res.status(200)
    .json(
       { 
         message: "Email confirmed",
         token: newToken
       });
         
   } catch(err){
     next(err);
}}
 



router.post ("/email-verified", 
emailVerified, 
updateToken
);

module.exports = router;