const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const { v4: uuidv4 } = require('uuid');

const {spawn} = require('child_process');



const compressVideoFile = (inputFilePath, outputFilePath, resolution, bitrate) => {
    console.log(outputFilePath);
    return new Promise((resolve, reject) => {
        const ffmpegProcess = spawn(ffmpegPath, [
            '-i', inputFilePath,
            '-s', resolution,
            '-b:v', bitrate,
            outputFilePath
        ]);
        ffmpegProcess.on('error', (err) => {
            reject(`Error while running ffmpeg process for video: ${err}`);
        });
        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                resolve(`File ${inputFilePath} successfully compressed.`);
            } else {
                reject(`Error while compressing video file ${inputFilePath}`);
            }
        });
    });
}

const imageForVideoFile = (inputFilePath, outputFilePath, resolution, quality) => {
    console.log(outputFilePath);
    return new Promise((resolve, reject) => {
        const ffmpegProcess = spawn(ffmpegPath, [
            '-i', inputFilePath,
            '-ss', '00:00:05',
            '-vf', `scale=${resolution}`,
            '-frames:v', '1', // Only one frame needed
            '-q:v', quality,
            outputFilePath
        ]);
        ffmpegProcess.on('error', (err) => {
            reject(`Error while running ffmpeg process for image: ${err}`);
        });
        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                resolve(`File ${inputFilePath} successfully processed.`);
            } else {
                reject(`Error while processing image file ${inputFilePath}`);
            }
        });
    });
}




function createDirs(dirsName, exportDirPath){
    console.log(exportDirPath)
    dirsName.forEach( dir => {
        let fullPath = path.join(exportDirPath, dir);
        console.log('fullPath',fullPath);
        fs.mkdir(fullPath,(err)=>{
            if(err){
                return console.error(err);
            }
            console.log('Directory created');
        });
    })
}


async function compressAllFiles(req, res, next){
    try{
        const {importDirPath} = req.body;
        const {exportDirPath} = req.body;

        const dirFiles = fs.readdirSync(importDirPath);

        const videoFiles = dirFiles.filter(file => {
            const ext = path.parse(file).ext;
            return ext === '.mov' || ext === '.mp4'
        });

        const dirsName = ['pay','preview','thumbnail']
        createDirs(dirsName, exportDirPath);


        const result = await Promise.all(

            videoFiles.map(async (video, inx) => {
                let fileName = uuidv4();
                const videoPath = path.join(importDirPath, video);
                console.log('videoPath', videoPath);
                const promise = [
                    compressVideoFile(videoPath, path.join(exportDirPath,'pay',`${fileName}.mp4`),'1920x1080','10000k'),
                    compressVideoFile(videoPath, path.join(exportDirPath,'preview',`${fileName}.mp4`),'640x320','1000k'),
                    imageForVideoFile(videoPath, path.join(exportDirPath,'thumbnail',`${fileName}.jpg`),'640x320','3'),
                ]

             return Promise.all(promise)
            })
        )

        console.log(result);

        res.status(200).json({message: 'complate'});
    } catch(err){
        console.error(err)
        next(err);
    }
}

router.post("/v1/video-compressor", compressAllFiles);
router.get("/v1/video-compressor", (req, res, next) => {
    res.sendFile(path.join( __dirname,'videoCompressor.html'));
});
    

module.exports = router;