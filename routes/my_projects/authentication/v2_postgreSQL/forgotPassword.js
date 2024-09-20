const express = require("express");
const router = express.Router();
const dbUtils = require("./js/dbUtils");
const {checkPassword, checkEmail} = require("./middleware/authMW");

const { jwtTokenUtils } = require("./js/utils");
const { emailTextUtils, sendEmail } = require("./js/sendEmail");

async function updateUserPasswordInDb(userPassword, decoded) {
  try{
    const client = await dbUtils.dbConnect.userPool;

    const query = `
          UPDATE users SET user_hashed_password = $1, user_salt = $2 WHERE user_id = $3
      `;

    const userSalt = await passwordUtils.saltGenerator();

    const userHashedPassword = await passwordUtils.hashedGenerator(userPassword, userSalt);

    await client.query(query, [userHashedPassword, userSalt, decoded.userId]);
  }catch(err){
      throw new Error(err);
  }
}

async function selectUserIdInDb(userEmail) {
  console.log(userEmail);
  try{
  const client = await dbUtils.dbConnect.userPool;
  const query = `
        SELECT user_id FROM users WHERE user_email = $1
    `;

    const {rows} = await client.query(query, [userEmail]);
    if(!rows?.length) throw new Error('No User found');

    return rows[0].user_id;
  }catch(err){
    throw new Error(err);
  }
}




async function sendTokenToUserEmail(req, res, next) {
  const { userEmail } = req.body;
  try {
    const userId = await selectUserIdInDb(userEmail);

    const emailToken = await jwtTokenUtils.jwtSign({
      userId: userId,
      forPasswordRecovery: true
    });

    sendEmail(userEmail, emailTextUtils.resetPasswordEmail(emailToken));

    res.status(200).json("Email has been sent successfully.");

    }catch (err) {
      next(err);
  }
}

async function passwordRecovery(req, res, next) {
  const { userPassword, emailToken } = req.body;

  try {
   
    const decoded = await jwtTokenUtils.jwtVerify(emailToken, false);
    if(!decoded.forPasswordRecovery){
      throw new Error('Invalid email token')
  }
    await updateUserPasswordInDb(userPassword, decoded);
    
    res.status(200).json({ message: "The password has been updated" });
    
  } catch (err) {
    next(err);
  }
}

router.post("/forgot-password", checkEmail, sendTokenToUserEmail);
router.post("/password-recovery", checkPassword, passwordRecovery);

module.exports = router;
