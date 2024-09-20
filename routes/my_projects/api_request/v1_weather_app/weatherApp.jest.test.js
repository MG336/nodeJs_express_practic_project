const request = require('supertest');
const express = require('express');
const path = require('path');
const weatherApp = require('./weatherApp');
const nock = require('nock');

const app = express();
app.get('/v1/api-request-weather-app', weatherApp);

app.use('/',weatherApp);
app.use(express.json());

describe('weatherApp',()=>{
    it('should send html', async ()=> {
        const response = await request(app)
        .get('/v1/api-request')
        .expect(200)
        expect(response.text).toContain('<!DOCTYPE html>');
    })

    it('should return weather https://api.openweathermap.org', async ()=> {
        await request(app)
        .get('/v1/api-request-weather-app?city=London')
        .expect(200)
        .expect('Content-Type', /json/)
    })

    it('should return weather data for a valid city', async ()=> {
        const city = 'London';

        nock('https://api.openweathermap.org')
            .get('/data/2.5/weather')
            .query({ q: city, appid: 'a52a697e4e1a0bbf36d2d219893c6329'}) //
            .reply(200, {
                name: city,
                main: { temp: 280.32, humidity: 81 },
                weather: [{ description: 'clear sky' }]
            });

            const response = await request(app)
            .get(`/v1/api-request-weather-app`)
            .query({ city });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', city);
        expect(response.body).toHaveProperty('main');
        expect(response.body.main).toHaveProperty('temp');
        expect(response.body.main).toHaveProperty('humidity');
        expect(response.body.weather[0]).toHaveProperty('description', 'clear sky');
    })

    
    it('should return 400 if city is not specified', async () => {
        const response = await request(app).get('/v1/api-request-weather-app');
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Site not specified');
    });


    it('should handle error response from the weather API', async () => {
        const city = 'UnknownCity';
        
        nock('https://api.openweathermap.org')
            .get('/data/2.5/weather')
            .query({ q: city, appid: 'a52a697e4e1a0bbf36d2d219893c6329' })
            .reply(404, { message: 'city not found' });

        const response = await request(app)
            .get(`/v1/api-request-weather-app`)
            .query({ city });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'city not found');
    });
})