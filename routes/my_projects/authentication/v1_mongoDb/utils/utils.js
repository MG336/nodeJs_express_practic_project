const crypto = require("crypto");
const jwt = require('jsonwebtoken');
// const {key} = require('./key');
const key = 'key';
// const key = 'key';

//Авторизация


passwordUtils = {
  checkPassword(userHashedPassword, userPassword, userSalt) {
    
    if (!userHashedPassword) {
      throw new Error("Incorrect username or password.");
    }
    
    return new Promise(async (resolve, reject) => {
      try{
        const hashed = await this.hashedGenerator(userPassword, userSalt);

        if (!crypto.timingSafeEqual(userHashedPassword, hashed)) {
          throw new Error("Incorrect username or password.");
        }
        resolve();

      }catch(err){
        reject(new Error(err));
      }
      
    });
  },

  saltGenerator() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, salt) => {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(salt);
        }
      });
    });
  },

  hashedGenerator(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, hashed) => {
        if (err) {
          reject(err);
        } else {
          resolve(hashed);
        }
      });
    });
  },
}      

jwtTokenUtils = {
  //Create token
  // userId, userEmail, userEmailVerified, expiresIn
  async jwtSign({
    userId = undefined, 
    userEmail = undefined, 
    userEmailVerified = false, 
    expiresIn = '168h', 
    forCheckEmail = false,
    forPasswordRecovery = false,
    userBlock = false
  }) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          userId, 
          userEmail, 
          userEmailVerified, 
          forCheckEmail, 
          forPasswordRecovery, 
          userBlock
        },
        key,
        { expiresIn},
        (err, newToken) => {
          if (err) {
            reject(new Error(err))
          } else {
            resolve(newToken)
          }
        }
      );
    });
  },
            
  //Decoded token
  jwtVerify(token, ignoreExpiration){
    return new Promise((resolve, reject) => {
      jwt.verify(token, key, {ignoreExpiration: true},(err, decoded)=>{
          if(err){
            reject(new Error('Invalid token'));
          }else{
            resolve(decoded)
          }
      })
    })
  } 

}


checkReqUtils = {

    emailRegex : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    passwordRegex: /^[A-Za-z0-9_\!\@\#\$\%\^\&\*\?\)\.\+\(<>\-]+$/,


    checkPassword(password) {
      if(!password || password.length > 30 || password.length < 8 || !this.passwordRegex.test(password)){
        throw new Error('Incorrect username or password.');
      }},


    checkEmail(email) {
      if(!email || email.length > 30 || email.length < 4 || !this.emailRegex.test(email)){
        throw new Error('Incorrect username or password.');
      }},

    authHeaderCheck(authHeader){
      if(authHeader && authHeader.startsWith("Bearer ")){
        token = authHeader.substring(7);
      }else{
          throw new Error("Invalid token");
      }
      return token 
    }

  }

  randomGenerators = {
    sixNumbers(){
      return  Math.floor(100000 + Math.random() * 900000)+'';
    }
  }
    


module.exports = {
    jwtTokenUtils,
    checkReqUtils,
    passwordUtils,
    randomGenerators
}