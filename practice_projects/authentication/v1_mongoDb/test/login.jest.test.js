const express = require("express");
const request = require("supertest");
const app = express();
const login = require('../login');

app.use(express.json())
app.use(login);


jest.mock("../utils/utils.js", () => ({
    passwordUtils: {
      checkPassword: jest.fn(() => true),
    },
    jwtTokenUtils: {
      jwtSign: jest.fn(() => "mockToken"),
    },
}));

jest.mock("../middleware/authMW.js", () => ({
    checkPassword: jest.fn((req, res, next) => {
      next();
    }),
    checkEmail: jest.fn((req, res, next) => {
      next();
    }),
}));

const mockFindOne = jest.fn();


  app.locals.mongoDb = {
    mongoDbConnect: Promise.resolve({
        collection: jest.fn(() => ({
            findOne: mockFindOne
    })),
    }),
};  


describe('POST /v1/login', ()=> {

    beforeEach(() => {
        mockFindOne.mockReset();
    });

    it("should login a user and return a token", async ()=>{

        mockFindOne.mockResolvedValue({
            _id: "mockUserId",
            email: "test@example.com",
            hash_password: { buffer: Buffer.from("hashed_password") },
            salt: { buffer: Buffer.from("salt") },
            verified: true,
            block: false,
        });


        const response = await request(app)
        .post('/v1/login')
        .send({
            userEmail: 'test@example.com',
            userPassword: "StrongP@ssw0rd",
        })
        .expect(200);

    expect(response.body.token).toBe("mockToken")
    expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
    
    expect(require("../utils/utils.js").passwordUtils.checkPassword).toHaveBeenCalledWith(
        expect.any(Buffer),
        "StrongP@ssw0rd",
        expect.any(Buffer)
      );

    expect(require("../utils/utils.js").jwtTokenUtils.jwtSign).toHaveBeenCalledWith({
    userId: "mockUserId",
    userEmail: "test@example.com",
    userEmailVerified: true,
    userBlock: false,
    });
})
it("should return an error and call next(err) if the user is not found", async () => {

    mockFindOne.mockResolvedValue(null);

    const response = await request(app)
        .post("/v1/login")
        .send({
            userEmail: "nonexistent@example.com",
            userPassword: "StrongP@ssw0rd",
        });

    expect(response.status).toBe(500);

    // expect(response.body).toEqual(
    //     expect.objectContaining({
    //         error: expect.any(String),
    //     })
    // );

    expect(mockFindOne).toHaveBeenCalledWith({ email: "nonexistent@example.com" });
});
    
})
    


