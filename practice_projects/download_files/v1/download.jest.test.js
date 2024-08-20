const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;


const downloadRouter = require('./download');

const app = express();
app.use('/', downloadRouter);

jest.mock('fs', ()=>{
    promise: {
        access: jest.fn()
    }
})

describe('Download File Route',()=>{
    const mockFileName = 'testFile.text';
    const mockFilePath = path.join(__dirname, 'uploads', mockFileName);

    beforeEach(()=>{
        fs.access.mockClear();
    })

    it('should download the file if it exists', async()=>{
        fs.access.mockResolvedValueOnce();

        const res = await request(app)
        .get(`/v1/download/${mockFileName}`)
        .expect(200)
        .expect('Content-Disposition', `attachment; filename="${mockFileName}"`)

        expect(fs.access).toHaveBeenCalledWith(mockFilePath);
    })
})