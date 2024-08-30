const request = require('supertest');
const express = require('express');
const path = require('path');
const downloadFiles = require('./uploadFiles');

describe('upload files', ()=> {
    const app = express();
    
    it('should upload file and return success message', async ()=>{
        app.use('/',downloadFiles)
        const filePath = path.join(__dirname, 'fileForUpload', '1.txt')
        const result = await request(app)
        .post('/v1/upload')
        .attach('file', filePath);
        expect(result.statusCode).toEqual(200);
        expect(result.body.message).toEqual('File uploaded successfully');
    });

    it('should send html',async ()=>{
        const result = await request(app)
        .get('/v1/upload')
        .expect(200);
        expect(result.text).toContain('<!DOCTYPE html>');
    });

    

})
