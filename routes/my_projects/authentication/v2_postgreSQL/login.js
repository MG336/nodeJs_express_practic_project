const express = require("express");
const router = express.Router();
const dbUtils = require("./js/dbUtils");
const {checkPassword, checkEmail} = require("./middleware/authMW");
const {passwordUtils,jwtTokenUtils} = require("./js/utils");



async function selectUserInDb(userEmail) {
  // Take client
  try {
  const userPool = await dbUtils.dbConnect.userPool;

  //Select a user in the db
  const query = `SELECT * FROM users WHERE user_email = $1`;
  const {rows} = await userPool.query(query, [userEmail]);

  if(rows.length === 0) throw new Error("Incorrect username or password.");
  
  return rows[0];

  } catch (err) {
      throw new Error(err);
  }
}

async function login(req, res, next) {
  const { userEmail, userPassword } = req.body;
  console.log(req.body);
  try {

    //Take user data in db
    const row = await selectUserInDb(userEmail);

    //Check password
    await passwordUtils.checkPassword(row.user_hashed_password, userPassword, row.user_salt);

    //Generate token
    const token = await jwtTokenUtils.jwtSign(
      {  
          userId: row.user_id,
          userEmail: row.userEmail,
          userEmailVerified: row.user_email_verified
      })
    //Send token
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

router.post("/login",
checkPassword,
checkEmail,
login
);
module.exports = router;
