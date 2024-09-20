
const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {ObjectId} = require('../../../../connectDb/mongoDb');


function createArrFromDir(req, res, next){
    console.log('start');
    // 
    try{
        const {insertDirPath} = req.body;
        console.log('insertDirPath',insertDirPath)
        const allEntries = fs.readdirSync(insertDirPath);

        

        const dirs = allEntries.filter(entry => {
            const fullPath = path.join(insertDirPath,entry);
            return fs.statSync(fullPath).isDirectory();
        })

        const arr = [];


        dirs.forEach(dir => {

            const filesPath = path.join(insertDirPath, dir);
            const files = fs.readdirSync(filesPath);

            let obj = {};
            
            files.forEach(file => {
                const fileParse = path.parse(file);
                obj = {
                    "_id": fileParse.name,
                }
                
                obj[dir] = fileParse.ext;
                arr.push(obj);
            })
        })

        req.insertData = {arr};
        next()

    }catch(err){
        next(err);
    }
}
        
        
function createDocumentsForMongoDb(req,res,next){
    try {
    const documents = []
    const seenIds = new Map();
    const files = req.insertData.arr;

    files.forEach((file) => {
        const {_id, ...rest} = file;
        
        if(seenIds.has(_id)){
            const existingFile = seenIds.get(_id);
            Object.assign(existingFile, rest);

        }else {
            seenIds.set(_id,file);

            file._id = new ObjectId(file._id);
            documents.push(file);
        }
    })


    req.insertData.documents = documents;

    next()

    }catch(err){
        console.error(err)
        next(err);
    }
}
    

async function insertDataToMongoDb(req, res, next){
    try{
        const mongoDb = req.app.locals.mongoDb;
        const db = await mongoDb.mongoDbConnect;

        const documents = req.insertData.documents;

        const result = await db.collection('bg_video').insertMany(documents);

        if(!result.insertedCount){
            throw new Error('No files were added!')
        }
    } catch(err){
        console.error(err);
        next(err)
    }
}


router.post("/insertDataTuDb", createArrFromDir, createDocumentsForMongoDb, insertDataToMongoDb);
module.exports = router;