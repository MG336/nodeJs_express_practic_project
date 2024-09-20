const { error } = require("winston");
const logger = require("../js/logger");

function errHandler(err, req, res, next){
    
    
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';


    if(err.message.includes('jwt malformed')){
        return res.status(400).json({ error: "Verification failed" });
    }

    if(err.message.includes('jwt expired')){
        return res.status(400).json({error:'Token expired'});
    }

    if (err.message.includes("duplicate key value violates unique constraint")) {
        // Если email уже зарегистрирован
        return res.status(400).json({error: "There's already an account with that email"});
    }

    if (err.message.includes('Incorrect username or password')) {
        // Если email или password некорректны
        return res.status(400).json({error: err.message});
    }
    
    if (err.message.includes('jwt must be provided')) {
        return res.status(400).json({error: 'Unauthorized access'});
    }
    
    if (err.message.includes('JsonWebTokenError: invalid signature')) {
        return res.status(400).json({error: 'Unauthorized Error'});
    }    
    

    if (err.message.includes('Sent Email Time Error')) {
        return res.status(400).json({error: 'Sent Email Time Error'});
    }  

    if (err.message.includes('Error sending email')) {
        return res.status(400).json({error: 'Error sending email'});
    } 

    const basicErrors = [
        'Invalid data',
        'Email not verified',
        'Your account was blocked'
    ]



    const keyErrorMessages = [
        'Your email is already verified',
        'Email sending interval exceeded',
        'Email sending was blocked for 20 hours',
        'Data not found',
        'Invalid token',
        'Invalid or expired key',
        'Key expired',
        'Invalid key',
        'Key verification was temporarily blocked'
    ]
    

    const errorMessages = [...keyErrorMessages, ...basicErrors];


    if(errorMessages.some(errorMessages => err.message.includes(errorMessages))){
        return res.status(400).json({error: err.message});
    }

    //mongo
    if(err.message.includes('E11000')){
        return res.status(400).json({error: "There's already an account with that email" });
    }
    // res.status(statusCode).json({error: message})
    res.status(500).json({error: 'Internal Server Error'});
    logger.error(err.stack);
}

module.exports = {
    errHandler
}


