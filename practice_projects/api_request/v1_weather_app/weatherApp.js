
const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');

require('dotenv').config({path: path.join(__dirname,".env")});

const API_KEY = process.env.API_KEY

if(!API_KEY){
    console.error('Error: API_KEY is not defined in .env file.');
    process.exit(1);
}

async function weatherApp(req, res, next){
    const city = req.query.city;
    console.log('city', city)

    if(!city){
        return res.status(400).json({message: 'Site not specified'});
    }

   
    try {
        const weatherResponse = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params: {
                    q: city,
                    appid: API_KEY
                }
            }
        );
        res.status(200).json(weatherResponse.data)
    
    }catch(err){
        if(err.response){
            res.status(err.response.status).json({message: err.response.data.message})
        }else{
            next(new Error('server error'))
        }
    }
}


router.get('/v1/api-request-weather-app', weatherApp);
router.get('/v1/api-request',(req, res, next)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = router;
