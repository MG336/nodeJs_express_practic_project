const {jwtTokenUtils, randomGenerators,checkReqUtils} = require('../utils/utils');
const {sendEmail, emailTextUtils} = require("../utils/sendEmail");

async function sendKeyToUserEmail(req, res, next){
    try{
     await sendEmail(
        
        req.user.userEmail,
        emailTextUtils.sendKeyToEmail(req.user.keyVerifier)
      );
      next()
    }catch(err){
        next(err)
    }
  }

function checkKeyVerifier(req, res, next){
    try{
        const {keyVerifier} = req.body;
        
        if(keyVerifier.length !== 6){
            throw new Error('Invalid key');
        }

        next()
    }catch(err){
        next(err)
    }
}

  async function checkUserData(req, res, next) {
    try {
        console.log('checkAndUpdateSendEmailData')
        const mongoDb = req.app.locals.mongoDb;
        const db = await mongoDb.mongoDbConnect;
        const ObjectId = mongoDb.ObjectId;

        
       
        let userId, userEmail;
      
        
        if(req.user){
        
            userId = new ObjectId(req.user.userId);
            userEmail = req.user.userEmail;
            console.log('userId',userId);
            console.log('userEmail',userEmail);
        }else{
            
            userEmail = req.body.userEmail;
            req.user = {};
            console.log('userEmail',userEmail);
        }
        
        
        console.log('userId1111',userId)

        const filter = {
          $or: [{ _id: userId }, { email: userEmail }],
        };
        const findResult = await db.collection('users').findOne(
            filter 
        )
        
        console.log(' findResult1111', findResult)
        if(!findResult){
            throw new Error('Data not found')
        }

        if(findResult.block === true){
            throw new Error('Your account was blocked')
        }

        req.user.findResult = findResult;
        next()
        

    } catch (err) {
        next(err);
    }
}
    




async function updateUserData(req, res, next){
    try{
       const {findResult} = req.user;
       const mongoDb = req.app.locals.mongoDb;
       const db = await mongoDb.mongoDbConnect;

       const filter = {_id: findResult._id};

       const penaltyHours = 20 * 60 * 60 * 1000 ;// 20 часов в миллисекундах
       const resetHours = 60 * 60 * 1000;
       const currentDate = Date.now();
        const timeInterval = 60 * 1000; // 1 минута

       const updatedData = {};
        let key;

        if(findResult.emailSend.date > (currentDate - timeInterval)){
            throw new Error('Email sending interval exceeded')
        }

        if(findResult.emailSend.penalty > 2){
            updatedData['block'] = true;
            db.collection('users').updateOne(filter, {$set: updatedData});
            throw new Error('Your account was blocked');
        }

       if(currentDate >= findResult.emailSend.date + resetHours){
           updatedData["emailSend.count"] = 1;
       }

       

       if(findResult.emailSend.count > 10){
           updatedData["emailSend.date"] = currentDate + penaltyHours;
           
           if(findResult.emailSend.penalty){
               updatedData["emailSend.penalty"] = ++findResult.emailSend.penalty;
           }else {
               updatedData["emailSend.penalty"] = 1;
           }
           
           updatedData["emailSend.count"] = 1;

           db.collection('users').updateOne(filter, {$set: updatedData});
           throw new Error('Email sending was blocked for 20 hours')

       }else{
            key = randomGenerators.sixNumbers();
            updatedData["emailSend.count"] = ++findResult.emailSend.count;
            updatedData["emailSend.date"] = currentDate;
            updatedData["emailSend.key"] = key;
       }
       
       const result = await db.collection('users').updateOne(filter, {$set: updatedData});

        if (result.matchedCount > 0 && result.modifiedCount > 0) {
            req.user = {
                keyVerifier: key,
                userEmail: findResult.email
            }
            next();
        }else {
            throw new Error('Error updating sending email data');
        }

       // const result = await db.collection('users').updateOne(
       //     filter,

       //     [
       //         {
       //             $set: {
                  
       //                 "emailSend.count": {
       //                     $cond: {
       //                         // if: { $gte: ["$emailSend.count", 10] },
       //                         if:{$gte:[currentDate,{$add:["$emailSend.date", resetHours]}]},
       //                         then: 1,
       //                         else: { $add: ["$emailSend.count", 1]}
       //                     }
       //                 },

       //                 "emailSend.date": {
       //                     $cond: {
       //                         if: { $gte: ["$emailSend.count", 10] },
       //                         then: currentDate + penaltyHours,
       //                         else: currentDate
       //                     }
       //                 },

       //                 "emailSend.key":key,
                       // "emailSend.key": {
                       //     $cond:{
                       //         if:{$lt: ["emailSend.date", {$subtract: [currentDate, timeInterval]}]},
                       //         then: key,
                       //         else: "emailSend.key"
                       //     }
                       // },

                       
       //             }
       //         }
       //     ]
       // );

       console.log('result', result);
    }catch(err){
        next(err)
    }
}

async function checkResult(req, res, next){
    try{
      const {findResult} = req.user;
      console.log('findResult',findResult)
      const { userEmail, userPassword, keyVerifier } = req.body;
      const mongoDb = req.app.locals.mongoDb;
      const db = await mongoDb.mongoDbConnect;
      const filter = {_id: findResult._id};

      const penaltyHours = 20 * 60 * 60 * 1000 ;// 20 часов
      const currentDate = Date.now();
      const timeOfAction = 60 * 60 * 1000;

      if(findResult.keyVerifier){
        
        const updatedData = {};

        if(findResult.emailSend.date > currentDate){
          throw new Error('Key verification was temporarily blocked');
        }

        if(findResult.emailSend.date + timeOfAction < currentDate){
            throw new Error('Key expired');
        }
          

        if(findResult.emailSend.key !== keyVerifier){
            
          if(findResult.keyVerifier.penalty > 2){
              updatedData['block'] = true;
              db.collection('users').updateOne(filter, {$set: updatedData});
              throw new Error('Your account was blocked');
            }
           
            if(findResult.keyVerifier.count > 5){
              updatedData["emailSend.date"] = currentDate + penaltyHours;
              updatedData["keyVerifier.penalty"] = ++findResult.keyVerifier.penalty;
              updatedData['keyVerifier.count'] = 0;
              db.collection('users').updateOne(filter, {$set: updatedData});
              throw new Error('Invalid key, email sending was blocked for 20 hours')
            }

            updatedData['keyVerifier.count'] = ++findResult.keyVerifier.count;
            db.collection('users').updateOne(filter, {$set: updatedData});
            throw new Error('Invalid key');
        }

      }
      next()
    }catch(err){
      next(err)
    }
}

module.exports = {
    sendKeyToUserEmail,
    checkUserData,
    updateUserData,
    checkResult,
    checkKeyVerifier
}
    
