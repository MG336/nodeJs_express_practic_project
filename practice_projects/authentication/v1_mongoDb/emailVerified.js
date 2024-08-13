const express = require("express");
const router = express.Router();
const {jwtTokenUtils} = require("./utils/utils");
const {decodedToken} = require("./middleware/authMW");


async function checkKeyInDb(req, res, next) {
  try {
    const mongoDb = req.app.locals.mongoDb;
    const { key } = req.body;

    const db = await mongoDb.mongoDbConnect;
    const ObjectId = mongoDb.ObjectId;
    const userId = new ObjectId(req.user.userId);

    const currentDate = Date.now();
    const timeOfAction = 60 * 60 * 1000;
    console.log(Date.now());

    const result = await db.collection("users").updateOne(
      {
        _id: userId,
        "emailSend.key": key,
        verified: false
      },
      [
        {
          $set: {
            verified: {
              $cond: {
                if: { $gte: ["$emailSend.date", currentDate - timeOfAction] },
                then: true,
                else: "$verified",
              },
            },
          },
        },
      ]
    );
    

    if (result.matchedCount > 0 && result.modifiedCount > 0) {
      next();
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      throw new Error("Key expired");
    } else {
      throw new Error("Data not found");
    }
  } catch (err) {
    next(err);
  }
}

async function updateToken(req, res, next) {
  const {userId, userEmail} = req.user;
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


router.post ("/v1/email-verified", 
decodedToken,
checkKeyInDb,
updateToken
);

module.exports = router;