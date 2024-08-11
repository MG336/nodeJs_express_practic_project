
// TASK: 
// Create a RESTful API for managing tasks using Express and PostgreSQL. 
// The API should support creating, reading, updating, and deleting tasks (CRUD).

const express = require("express");
const router = express.Router();
const {poolPostgreSQL} = require('../../connectDb/postgreSQL');

function checkDatabaseResult(result){
    // if(result.rows.length === 0) {return res.status(404).json({message: 'Task not found'})}
    if(result.rows.length === 0){
        throw new Error('Task not found');
    }
}

async function createTask(req, res, next){
    const {title, completed} = req.body;

    try{
        const result = await poolPostgreSQL.query(
            'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
            [title, completed || false]
        );
        res.status(201).json(result.rows[0]);
    }catch(err){
        console.error(err);
        // res.status(500).json({message:'Server error'});
        next(err)
    }
}

async function getAllTasks(req, res, next){
    try{
        const result = await poolPostgreSQL.query(
            'SELECT * FROM tasks'
        )
        res.status(200).json(result.rows[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
}

async function getTaskById(req,res,next){
    const {id} = req.params;
    try{
        const result = await poolPostgreSQL.query(
            'SELECT * FROM tasks WHERE id = $1',[id]
        )

        checkDatabaseResult(result);
            
        res.status(200).json(result.rows[0]);
    }catch(err){
        console.error(err);
        // res.status(500).json({ message: 'Server error' });
        next(err);
    }
}

async function updateTaskById(req, res, next) {
    const {id} = req.params;
    const {title, completed} = req.body;
    try{
        const result = await poolPostgreSQL.query(
            'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
            [title, completed, id]
        );
        checkDatabaseResult(result);
        res.json(result.rows[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
}

async function deleteTaskById(req, res, next) {
    const {id} = req.params;
    try{
        const result = await poolPostgreSQL.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *', [id]
        )
        checkDatabaseResult(result);
        res.status(204).end();
    }catch(err){
        console.error(err);
        next(err);
    }
}



      

//  status HTTP
//      - 200 OK — успешный запрос.
//      - 201 Created — ресурс успешно создан.
//      - 204 No Content — успешное удаление без содержимого.
//      - 400 Bad Request — ошибка в запросе клиента.
//      - 401 Unauthorized — требуется аутентификация.
//      - 403 Forbidden — доступ запрещен.
//      - 404 Not Found — ресурс не найден.
//      - 500 Internal Server Error — ошибка на сервере.



router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.get('/tasks/:id', getTaskById);
router.put('/tasks/:id', updateTaskById);
router.delete('/tasks/:id', deleteTaskById);

module.exports = router;