const express = require("express");
const router = express.Router();
const { jwtTokenUtils } = require("./utils/utils");
const { decodedToken } = require("./middleware/authMW");
const sendEmailMW = require("./middleware/sendEmailMW");


async function updateToken(req, res, next) {
  try {
    const { userId, userEmail } = req.user;
    const newToken = await jwtTokenUtils.jwtSign({
      userId: userId,
      userEmail: userEmail,
      userEmailVerified: true,
      userBlock: req.user.block
    });
    res.status(200).json({
      message: "Email confirmed",
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
}

async function updateVerified(req, res, next){
  try{
    const {findResult} = req.user;

    if(findResult.verified === true){
      throw new Error('Your email is already verified');
    }

    const mongoDb = req.app.locals.mongoDb;
    const db = await mongoDb.mongoDbConnect;
    const filter = {_id: findResult._id};

    const result = await db.collection("users").updateOne(
      filter,
      {
        $set:{
          verified: true
        }
      }
    );

    if (result.matchedCount > 0 && result.modifiedCount > 0) {
        next();
    } else {
      throw new Error("Update user verified error");
    }
   
  }catch{
    next(err);
  }
}




    
//keyVerified
router.post(
  "/v1/key-verified",
  sendEmailMW.checkKeyVerifier,
  decodedToken,
  sendEmailMW.checkUserData,
  sendEmailMW.checkResult,
  updateVerified,
  updateToken
);

module.exports = router;

