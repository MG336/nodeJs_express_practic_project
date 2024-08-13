const express = require("express");
const router = express.Router();
const { checkPassword, checkEmail } = require("./middleware/authMW");

const sendEmailMW = require("./middleware/sendEmailMW");

function sendMessage(req, res, next) {
  res
    .status(200)
    .json({
      message: "A confirmation key has been sent to your email address",
    });
}

async function updatedPassword(req, res, next) {
  try {
    const { userPassword } = req.body;
    const { findResult } = req.user;
    const mongoDb = req.app.locals.mongoDb;
    const db = await mongoDb.mongoDbConnect;
    const filter = { _id: findResult._id };

    const userSalt = await passwordUtils.saltGenerator();

    const userHashedPassword = await passwordUtils.hashedGenerator(
      userPassword,
      userSalt
    );

    const result = await db.collection("users").updateOne(filter, {
      $set: {
        hash_password: userHashedPassword,
        salt: userSalt,
        "emailSend.date": 0,
        "keyVerifier.count": 0,
        "keyVerifier.penalty": 0,
        "emailSend.penalty": 0,
      },
    });

    if (result.matchedCount > 0 && result.modifiedCount > 0) {
      res.status(200).json({ message: "The password has been updated" });
    } else {
      throw new Error("Update password error");
    }
  } catch (err) {
    next(err);
  }
}

router.post(
  "/v1/forgot-password",
  checkEmail,
  sendEmailMW.checkUserData,
  sendEmailMW.updateUserData,
  sendEmailMW.sendKeyToUserEmail,
  sendMessage
);

router.post(
  "/v1/password-recovery",
  checkEmail,
  sendEmailMW.checkKeyVerifier,
  checkPassword,
  sendEmailMW.checkUserData,
  sendEmailMW.checkResult,
  updatedPassword
);

module.exports = router;
