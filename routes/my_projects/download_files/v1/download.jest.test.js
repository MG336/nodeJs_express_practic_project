const request = require('supertest');
const express = require('express');

const download = require('./download.js');

const app = express();

describe('Download File Route',()=>{

    app.use('/', download);
    it('should load html',async ()=>{
        const result = await request(app)
        .get('/v1/download/')
        .expect(200);
        expect(result.text).toContain('<!DOCTYPE html>');
    })

    it('should download 1.txt', async()=>{
        await request(app)
        .get('/v1/download/1.txt')
        .expect(200)
    })
})

