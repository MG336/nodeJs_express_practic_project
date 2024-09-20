const express = require('express');
const router = express.Router();
const {decodedToken} = require("./middleware/authMW");
const sendEmailMW = require("./middleware/sendEmailMW");



function sendDataToUser(req, res){
    res.status(200).json(
        {message: 'Email has been sent successfully.'
    });
}


router.post('/v1/resend-email',
    decodedToken, 
    sendEmailMW.checkUserData,
    sendEmailMW.updateUserData,
    sendEmailMW.sendKeyToUserEmail,
    sendDataToUser
)


module.exports = router