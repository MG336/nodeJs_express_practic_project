const express = require("express");
const request = require("supertest");
const app = express();

const signUp = require("../signUp");

app.use(express.json())
app.use(signUp);

jest.mock("../utils/utils.js", () => ({
    passwordUtils: {
      saltGenerator: jest.fn(() => "mockSalt"),
      hashedGenerator: jest.fn(() => "mockHashedPassword"),
    },
    jwtTokenUtils: {
      jwtSign: jest.fn(() => "mockToken"),
    },
    randomGenerators: {
      sixNumbers: jest.fn(() => "123456"),
    },
}));

jest.mock("../middleware/sendEmailMW.js", () => ({
    sendKeyToUserEmail: jest.fn((req, res, next) => {
      next();
    }),
}));

jest.mock("../middleware/authMW.js", () => ({
    checkPassword: jest.fn((req, res, next) => {
      next();
    }),
    checkEmail: jest.fn((req, res, next) => {
      next();
    }),
}));

const mockInsertOne = jest.fn().mockResolvedValue({
    insertedId: "mockUserId",
  });

  
app.locals.mongoDb = {
    mongoDbConnect: Promise.resolve({
        collection: jest.fn(() => ({
        insertOne: mockInsertOne,
    })),
    }),
};  


describe("POST /v1/signup", () => {
    it("should sign up a user and return a token", async () => {
      const response = await request(app)
        .post("/v1/signup")
        .send({
          userEmail: "test@example.com",
          userPassword: "StrongP@ssw0rd",
        })
        .expect(200);
  
      expect(response.body.token).toBe("mockToken");
      expect(response.body.message).toBe(
        "Thank you for registering, a confirmation key has been sent to your email address."
      );
  
      // Check that the mocked functions were called
      expect(mockInsertOne).toHaveBeenCalledWith(expect.objectContaining({
        email: "test@example.com",
        hash_password: "mockHashedPassword",
        salt: "mockSalt",
      }));
    });
  });

  