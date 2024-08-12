const {MongoClient, ObjectId, Binary} = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'node_practice';
const mClient = new MongoClient(url);



const mongoDbConnect = (async function mg(){
    try {
        await mClient.connect();
        console.log('mongodb start');
        return mClient.db(dbName);
       

    }catch(err){
        console.error(err);
    }
})()

module.exports = {
    mongoDbConnect,
    ObjectId,
    Binary
}