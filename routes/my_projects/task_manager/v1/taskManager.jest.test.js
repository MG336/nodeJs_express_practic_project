const express = require("express");
const request = require("supertest");
const app = express();
const taskManager = require("./taskManager");
app.use(express.json());

app.use("/", taskManager);

jest.mock("../../../../connectDb/postgreSQL.js", () => {
  const mPool = {
    query: jest.fn(),
  };
  return { poolPostgreSQL: mPool };
});

const { poolPostgreSQL } = require("../../../../connectDb/postgreSQL");

describe("task manager v1", () => {
  
    it("get all tasks", async () => {
    poolPostgreSQL.query.mockResolvedValue({
      rows: [
        { id: 1, title: "Task 1", completed: false },
        { id: 2, title: "Task 2", completed: true },
      ],
    });

    await request(app).get("/v1/tasks").expect(200);
  });

  it("create task", async () => {
    const newTask = {
      title: "Test Task",
      completed: false,
    };

    //send promise with value...
    poolPostgreSQL.query.mockResolvedValue({
      rows: [{ id: 1, title: newTask.title, completed: newTask.completed }],
    });

    const response = await request(app)
      .post("/v1/create-task")
      .send(newTask)
      .expect(201)
      .expect("Content-Type", /json/);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("title", newTask.title);
    expect(response.body).toHaveProperty("completed", newTask.completed);

    expect(poolPostgreSQL.query).toHaveBeenCalledWith(
      "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *",
      [newTask.title, newTask.completed]
    );
  });

  it("get task by id", async () => {
    poolPostgreSQL.query.mockResolvedValue({
      rows: [{ id: 1, title: "Task 1", completed: false }],
    });

    const response = await request(app)
      .get("/v1/task/1")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      id: 1,
      title: "Task 1",
      completed: false,
    });

    expect(poolPostgreSQL.query).toHaveBeenCalledWith(
      "SELECT * FROM tasks WHERE id = $1",
      ["1"]
    );
  });

  it("update task by id", async () => {
    const newTask = {
      title: "update task",
      completed: true,
    };

    poolPostgreSQL.query.mockResolvedValue({
      rows: [{ id: 1, title: "update task", completed: true }],
    });

    const response = await request(app)
      .put("/v1/task/1")
      .send(newTask)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("title", newTask.title);
    expect(response.body).toHaveProperty("completed", newTask.completed);
  });

  it("delete task by id", async () => {
    poolPostgreSQL.query.mockResolvedValue({
      rows: [{ id: 1, title: "update task", completed: true }],
    });

    const response = await request(app).delete("/v1/task/1").expect(204);

    expect(poolPostgreSQL.query).toHaveBeenCalledWith(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      ["1"]
    );

    expect(response.body).toEqual({});
  });
});
