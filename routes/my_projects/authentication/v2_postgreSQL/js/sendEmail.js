const nodemailer = require('nodemailer');
const siteName = 'mgreel.com';
const settings = require('./settings');


const emailTextUtils = {

    signUpEmail(token){
        return {
          hrefUrl: `${settings.siteUrl}/?emailToken=${token}`,
          subject:"Confirm your email address",
          setHtml(){
              return `<p>Hello</p>
              <p>Thank you for registering with ${siteName}.<br></p> 
              <p>To complete your registration, please click on the following link to confirm your email address:</p>
              <a href= ${this.hrefUrl} target="_blank">
              ${this.hrefUrl}
              </a><br><br>
              <p>If you didn't request this, please ignore this email. You won't get another one!</p>
          `
        }}
    },

    resetPasswordEmail(token){
        return {
            hrefUrl: `${settings.siteUrl}/password-recovery?token=${token}`,
            subject:"Reset your password",
            setHtml(){
                return `<p>Hello</p>
                We have received a password reset request for your account.</p>
                <a href= ${this.hrefUrl} target="_blank">
                ${this.hrefUrl}
                </a><br><br>
                <p>If you didn't request this, please ignore this email. You won't get another one!</p>
            `
          }}
    }

}


//Добавить проверку времени отправки email



async function sendEmail(userEmail, emailData){
    try{

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'watson71@ethereal.email',
            pass: 'aWdQgEAkHvMVD9Y7st'
        },
    });
        

    async function main(){
        const info = await transporter.sendMail({
            from: 'pupkin@gmail.com',
            to: userEmail,
            subject: emailData.subject,
            text: '',
            html: emailData.setHtml(settings.siteUrl)
        })
        console.log('Message sent', info.messageId)
    }
    main()
    }catch(err){

    }
};

module.exports = {
    sendEmail,
    emailTextUtils
    // addEmailToken
}

