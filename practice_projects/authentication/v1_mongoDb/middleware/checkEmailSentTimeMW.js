 

//postgreSQL
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

//mongoDb
async function checkEmailSend(req){
    const userId = req.user.userId;
    const mongoDb =  req.app.locals.mongoDb;
    const db = await mongoDb.mongoDbConnect;

    const user = await db.collection('users').findOne({_id: userId});

    if(!user){
        throw new Error('Incorrect username or password')
    }
}

async function updateEmailSendData(req, res, next){
    try{
    const userId = req.user.userId;
    const db = await req.app.locals.mongoDb.mongoDbConnect;

    const result = await db.collection.updateOne(
        {_id:ObjectId(userId)},
        {
            $inc:{'emailSend.sum':1},
            $set:{'emailSend.date': new Date()}
        }
    )
    if(result.modifiedCount === 1){
        next()
    } else {
       throw new Error('Email data not be update')
    }

    }catch(err){
        next(err)
    }
}


// sendKeyData




//Map
async function checkSendEmailTime ({storageType, intervalInMinutes}){
    return function testCheckEmail (req, res, next){
        return new Promise((resolve, reject) => {
            try {
                const key = req.user.userId;
                const storage = req.app.locals.storage[storageType];
                const currentTime = Date.now();
    
                if(!storage.has(key)){
                    resolve();
        
                }else{
                    let value = storage.get(key);
        
                    const {timeSent} = value;
                    
                    if((currentTime - timeSent) <= (intervalInMinutes * 60000)){
                        storage.delete(key);
                        reject (new Error("Sent Email Time Error"));
                    }
                    resolve();
                }
            }catch(err){
                reject(err)
            }
        }).then(()=>{
            next();
        }).catch(err => {
            next(err)
        })
    }
}
    
function addTimeSendEmail({value, storageType}){
    
    return function (req, res, next){

        const timeSent = Date.now();
        const key = req.user.userId;

        try{
            storage = req.app.locals.storage[storageType];

            const value = {
                timeSent
            }

            storage.set(key, value);
            next()
        }catch(err){
            throw new Error(err)
        }
    }
}



module.exports = {
    // checkEmailSentTime,
    // addTimeSendEmailToDb,
    checkSendEmailTime,
    addTimeSendEmail
}
