const { compile } = require("jade");
const dbUtils = require("../js/dbUtils");


async function checkEmailSentTime(req, res, next){

    const {userId} = req.body.decoded;//из токена

    try{
        // const client = await dbUtils.dbConnect.userPool;
        const client = await dbUtils.dbConnect.userPool;


        const query = `SELECT email_sent_time FROM users WHERE user_id = $1`;
        const result = await client.query(query, [userId]);
        
        const emailSentTime = result.rows[0]?.email_sent_time;


        const currentTime = new Date();
        const intervalInMinutes = 1; 
        
        if(!emailSentTime || (currentTime - emailSentTime) >= (intervalInMinutes * 60000)){
            next()
        }else{
            throw new Error('Sent Email Time Error');
        }
    }catch(err){
        next(new Error(err));
    }
}

async function addTimeSendEmailToDb(req, res, next){
    const {userId} = req.body.decoded;
    try{
        const client = await dbUtils.dbConnect.userPool;
        const query = `
            UPDATE users SET email_sent_time = CURRENT_TIMESTAMP 
            WHERE user_id = $1
        `;
        await client.query(query, [userId]);
        next()

    }catch(err){
        next(err);
    }
}


module.exports = {
    checkEmailSentTime,
    addTimeSendEmailToDb
}
