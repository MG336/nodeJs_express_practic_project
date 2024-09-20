const express = require('express');
const router = express.Router();

const {checkEmailSentTime, addTimeSendEmailToDb} = require("./middleware/checkEmailSentTimeMW");
const {decodedToken} = require("./middleware/authMW");

const {jwtTokenUtils } = require("./js/utils");
const {emailTextUtils, sendEmail} = require('./js/sendEmail');


async function resendEmail(req, res, next) {
    const {decoded} = req.body;
    console.log(decoded);
      try {

        if (decoded.userEmailVerified) {
            throw new Error("Your email is already verified");
        }
  
          //create new token
        const emailToken = await jwtTokenUtils.jwtSign(
        {  
            userId: decoded.userId,
            userEmail: decoded.userEmail,
            expiresIn: '24h',
            forCheckEmail: true
        });
        // console.log(emailToken);
        sendEmail(decoded.userEmail, emailTextUtils.signUpEmail(emailToken));

        next()

      } catch(err) {
          next(err);
      }
}

function sendDataToUser(req, res){
    res.status(200).json(
        {message: 'Email has been sent successfully.'
    });
}

router.get('/resend-email', 
    decodedToken, 
    checkEmailSentTime, 
    resendEmail,
    addTimeSendEmailToDb,
    sendDataToUser
);

module.exports = router;