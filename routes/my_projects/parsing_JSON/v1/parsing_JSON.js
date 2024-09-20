const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const router = express.Router();

async function filterProducts(req, res, next) {
    try{
        
        const jsonPath = path.join(__dirname,'items.json');
        const data = await fs.readFile(jsonPath, 'utf8');

        const items = JSON.parse(data);
        console.log('parse data', items);

        const filterItems = items.filter(item => item.price > 100);

        console.log('item price > 100:');
        console.log(filterItems);

        res.status(200).json({
            message: filterItems
        })
        
    }catch(err){
        next(err)
    }
}

router.get('/v1/parsing-json', filterProducts);
module.exports = router;


