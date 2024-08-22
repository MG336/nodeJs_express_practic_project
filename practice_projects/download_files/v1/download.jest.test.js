const request = require('supertest');
const express = require('express');
// const { describe } = require('vitest');
// const path = require('path');
// const fs = require('fs').promises;


const download = require('./download.js');

const app = express();
// const app = require('../../../app.js');
// const { expect } = require('vitest');
// app.use('/', downloadRouter);

// jest.mock('fs', ()=>{
//     promise: {
//         access: jest.fn()
//     }
// })

// describe('Download File Route',()=>{
//     const mockFileName = 'testFile.text';
//     const mockFilePath = path.join(__dirname, 'uploads', mockFileName);

//     beforeEach(()=>{
//         fs.access.mockClear();
//     })

//     it('should download the file if it exists', async()=>{
//         fs.access.mockResolvedValueOnce();

//         const res = await request(app)
//         .get(`/v1/download/${mockFileName}`)
//         .expect(200)
//         .expect('Content-Disposition', `attachment; filename="${mockFileName}"`)

//         expect(fs.access).toHaveBeenCalledWith(mockFilePath);
//     })
// })


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
    
// describe('Download File Route',()=>{
//     it('should return 404 when file is not found', async () => {
//         const response = await request(app)
//             .get('/v1/download')
//             .expect(400);
//         // expect(response.body.message).toBe('File not found');
//     });
// })


