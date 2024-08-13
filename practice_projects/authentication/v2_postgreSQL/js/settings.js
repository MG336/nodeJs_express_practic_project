class TokenParam {
    constructor(obj,emailVerified = 0,key,timeExpires='72h'){
        this.id = obj.id;
        this.userId = obj.id;
        this.userEmail = obj.email;
        this.emailVerified = emailVerified;
        this.key = key;
        this.expiresIn = {expiresIn:timeExpires};
    };
    sendToken (err, newToken) {
        if (err) {
            return res.status(500).json({error:'Error new token creating'});
        } else{
          res.status(200).json(
            { 
              message: "Email confirmed",
              token: newToken
            });
        }}
    } 
        

const settings = {
    emailRegex : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    passwordRegex: /^[A-Za-z0-9_\!\@\#\$\%\^\&\*\?\)\.\+\(<>\-]+$/,
    siteUrl: 'http://localhost:5173',
    serverUrl:'http://localhost:3000',
    TokenParam: TokenParam
}


module.exports = settings;