const express = require("express");
const router = express.Router();
const {
  passwordUtils,
  jwtTokenUtils,
  randomGenerators,
} = require("./utils/utils");

const sendEmailMW = require("./middleware/sendEmailMW");
const { checkPassword, checkEmail } = require("./middleware/authMW");

async function insertUserInMongoDb(req, res, next) {
  try {
    const { userEmail, userPassword } = req.body;
    const mongoDb = req.app.locals.mongoDb;
    const db = await mongoDb.mongoDbConnect;

    const userSalt = await passwordUtils.saltGenerator();
    const userHashedPassword = await passwordUtils.hashedGenerator(
      userPassword,
      userSalt
    );
    

    const key = randomGenerators.sixNumbers();
    const dataNow = new Date();

    const userData = {
      hash_password: userHashedPassword,
      email: userEmail,
      created_at: dataNow,
      salt: userSalt,
      verified: false,
      block: false,

      emailSend: {
        key: key,
        date: Date.now(),
        count: 1,
        penalty: 0,
      },

      keyVerifier:{
        penalty: 0,
        count: 0
      }
    };
      

    const result = await db.collection("users").insertOne(userData);

    req.user = {
      userId: result.insertedId,
      userEmail: userEmail,
      keyVerifier: key,
    };

    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
}

async function sendTokenToUser(req, res, next) {
  try {
    const token = await jwtTokenUtils.jwtSign({
      userId: req.user.userId,
      userEmail: req.user.userEmail,
      expiresIn: "24h",
    });
    res.status(200).json({
      token: token,
      message:
        "Thank you for registering, a confirmation key has been sent to your email address.",
    });
  } catch (err) {
    next(err);
  }
}

router.post(
"/v1/signup",
  checkPassword,
  checkEmail,
  insertUserInMongoDb,
  sendEmailMW.sendKeyToUserEmail,
  sendTokenToUser
);


module.exports = router;
