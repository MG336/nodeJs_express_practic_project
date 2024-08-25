//WebSocket чат
//Реализуйте простой чат-сервер с использованием WebSocket, 
//который позволяет нескольким пользователям обмениваться сообщениями в реальном времени.

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3001;

const server = http.createServer(app);

const wss = new WebSocket.Server({server});


wss.on('connection', (ws)=> {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log('received', message);

        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(message);
            }
        })
    });

    ws.on('close', ()=> {
        console.log('Client disconnected');
    });

    ws.on('error', (error)=> {
        console.log('WebSocket error:', error);
    });
})

app.use(express.static('public'));

server.listen(port, ()=> {
    console.log(`Server WebSocket is running on http://localhost:${port}`);
});

