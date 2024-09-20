const request = require('supertest');
const express = require('express');
const router = require('../addFileToMongoDb'); // укажите правильный путь к вашему роутеру
const path = require('path');
const fs = require('fs');

// in progress...

// Замокаем MongoDB
const mockInsertMany = jest.fn();

const mockDb = {
    collection: jest.fn(() => ({
        insertMany: mockInsertMany,
    })),
};

const mockMongoDbConnect = Promise.resolve(mockDb);

const mockApp = express();
mockApp.use(express.json());
mockApp.locals.mongoDb = { mongoDbConnect: mockMongoDbConnect };
mockApp.use('/', router);

// Замокаем файловую систему
jest.mock('fs');
jest.mock('path');

describe('POST /insertDataTuDb', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should insert data into the database', async () => {
        // Мокаем поведение функций fs
        fs.readdirSync.mockImplementation((dirPath) => {
            if (dirPath === '/some/test/dir') {
                return ['dir1', 'dir2'];
            }
            if (dirPath === '/some/test/dir/dir1') {
                return ['file1.txt'];
            }
            if (dirPath === '/some/test/dir/dir2') {
                return ['file2.txt'];
            }
            return [];
        });

        fs.statSync.mockImplementation((filePath) => ({
            isDirectory: () => filePath.includes('dir'),
        }));

        path.join.mockImplementation((...args) => args.join('/'));
        path.parse.mockImplementation((filePath) => ({
            name: path.basename(filePath, path.extname(filePath)),
            ext: path.extname(filePath),
        }));

        // Настраиваем mock MongoDB
        mockInsertMany.mockResolvedValue({ insertedCount: 2 });

        const res = await request(mockApp)
            .post('/insertDataTuDb')
            .send({ insertDirPath: '/some/test/dir' });

        expect(res.status).toBe(200);
        expect(mockInsertMany).toHaveBeenCalledTimes(1);
        expect(mockInsertMany).toHaveBeenCalledWith([
            { _id: expect.any(Object), dir1: '.txt' },
            { _id: expect.any(Object), dir2: '.txt' },
        ]);
    });

    // it('should handle error when no files are added', async () => {
    //     mockInsertMany.mockResolvedValue({ insertedCount: 0 });

    //     const res = await request(mockApp)
    //         .post('/insertDataTuDb')
    //         .send({ insertDirPath: '/some/test/dir' });

    //     expect(res.status).toBe(500);
    //     expect(res.body).toHaveProperty('error', 'No files were added!');
    // });
});