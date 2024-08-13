const winston = require('winston');

const logger = winston.createLogger({
    level:'error',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ],
    format: winston.format.combine(
        winston.format.json()
    )
})

module.exports = logger;