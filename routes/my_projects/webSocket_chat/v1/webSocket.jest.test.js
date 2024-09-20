const request = require('supertest');
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { Server } = require('ws');


const app = express();
const server = http.createServer(app);
const wss = new Server({ server });


wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});


app.use(express.static('public'));


describe('WebSocket server', ()=> {
    
    beforeAll((done) => {
        server.listen(3001, done);
    })

    afterAll((done) => {
        server.close(done);
    })

    test('should broadcast messages to all clients', (done) =>{
        const client1 = new WebSocket('ws://localhost:3001');
        const client2 = new WebSocket('ws://localhost:3001');

        client1.on('open', ()=> {
            client1.send('Hello from client1');
        });

        client2.on('message', (message) => {
            const receivedMessage = message.toString('utf8');
            expect(receivedMessage).toBe('Hello from client1');
            client1.close();
            client2.close();
            done();

        })
    })
})