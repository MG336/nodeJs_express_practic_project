const request = require('supertest');
const express = require('express');
const path = require('path');
const downloadFiles = require('./parsing_JSON');


const app = express();
describe ('parsing_JSON',()=>{
    it('return json', async ()=>{
        app.use('/', downloadFiles);
        const result = await request(app)
        .get('/v1/parsing-json');
        expect(result.statusCode).toEqual(200);
        expect(result.headers['content-type']).toMatch(/application\/json/);
        expect(result.body).toBeInstanceOf(Object);
        expect(result.body).toHaveProperty('message');
    })
})
        
