const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

async function downloadFile(req, res, next){
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    try{
        await fs.access(filePath);
        const newFileName = filename;
        res.download(filePath, newFileName, (err)=> {
            if(err){
                // res.status(500).json({
                //     message: 'Error downloading file',
                //     error: err.message
                // });
                next(err);
            }
        });
    }catch(err){
        next(new Error('file not found'));
    }

}

router.get('/v1/download/:filename', downloadFile);
router.get('/v1/download', (req, res)=>{
    // res.status(200)
    // res.sendStatus(200)
    res.sendFile(path.join(__dirname, 'download.html'));
});

module.exports = router;