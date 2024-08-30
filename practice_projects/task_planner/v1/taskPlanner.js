// Планировщик задач
// Создайте планировщик задач, который будет выполнять определенную функцию через заданный интервал времени.
// Например, вывод текущего времени в консоль каждые 5 секунд.
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




    

        
