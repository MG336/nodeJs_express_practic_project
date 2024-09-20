const express = require('express');
const request = require('supertest');
const app = express();
const taskPlanner = require('./taskPlanner');

app.use('/', taskPlanner);
jest.useFakeTimers();

describe('taskPlanner v1',()=>{
    afterAll(()=> {
        if(typeof server !== 'undefined') server.close();
    })

    it('taskPlanner start', (done)=>{

       
        request(app)
            .get('/v1/taskPlanner', taskPlanner)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if(err) return done(err);
                expect(res.body).toHaveProperty('message', 'taskPlanner start');

                jest.runAllTimers();

                done();
            })
    })
})