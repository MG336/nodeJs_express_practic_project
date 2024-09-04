// Task Scheduler
// Create a task scheduler that will perform a specific function at a specified interval.
// For example, output the current time to the console every 5 seconds.

const express = require('express');
const router = express.Router();


function logCurrentTime(){
    const now = new Date();
    console.log(`Time now: ${now.toLocaleTimeString()}` )
}

router.get('/v1/taskPlanner',(req, res, next) => {
    
    try{
        const intervalId = setInterval(logCurrentTime, 5000);
        
        setTimeout(()=> {
            clearInterval(intervalId);
            console.log('stop planner');
        }, 30000);
        
        console.log('taskPlanner stop')
        
        res.status(200).json({
            message: 'taskPlanner start',
        })
    }

    catch(err){
        err
    }
});

module.exports = router;




    

        
