// Загрузка файлов
// Напишите сервер, который позволяет загружать файлы на сервер и скачивать их по ссылке. 
// Используйте multer для обработки загрузки файлов.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();


async function createFolder(req, res, next){
    const uploadPath = path.join(__dirname, 'upload');

    //create folder if not exist
    // if(!await fs.exists(uploadPath)){
    //     await fs.mkdir(uploadPath)
    // }
    await fs.mkdir(uploadPath, { recursive: true });
    req.upload = {
        path: uploadPath
    }
    next()
}

   
async function uploadFiles(req, res, next) {
    const uploadPath = req.upload.path;
    
    try {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            //select file dir
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            //rename file
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    })

    const upload = multer({storage: storage});

    upload.single('file')

    res.status(200).json({
        message: 'File uploaded successfully',
        file: req.file
    })

    }catch(err){
        next(err)
    }
}


// const upload = multer({storage: storage});

router.post('/v1/upload',
    createFolder,
    uploadFiles
)

router.get('/v1/upload', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'uploadFiles.html'));
});

module.exports = router;

