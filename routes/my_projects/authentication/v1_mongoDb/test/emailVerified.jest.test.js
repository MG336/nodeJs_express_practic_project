const express = require("express");
const request = require("supertest");
const emailVerified = require("../emailVerified");

const app = express();
app.use(express.json());
app.use(emailVerified);

jest.mock("../utils/utils.js", () => ({
  jwtTokenUtils: {
    jwtSign: jest.fn(() => "mockNewToken"),
  },
}));

jest.mock("../middleware/authMW.js", () => ({
  decodedToken: jest.fn((req, res, next) => {
    req.user = {
      userId: "mockUserId",
      userEmail: "test@example.com",
      userEmailVerified: false,
    };
    next();
  }),
}));

const mockUpdateOne = jest.fn();
const mockMongoDbConnect = jest.fn(() => ({
  collection: () => ({
    updateOne: mockUpdateOne,
  }),
}));

app.locals.mongoDb = {
  mongoDbConnect: Promise.resolve(mockMongoDbConnect()),
  ObjectId: jest.fn().mockImplementation((id) => id),
};

describe("POST /v1/email-verified", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should email verified and return a token", async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    const response = await request(app)
      .post("/v1/email-verified")
      .send({ key: "123456" })
      .expect(200);

    expect(response.body).toEqual({
      message: "Email confirmed",
      token: "mockNewToken",
    });

    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.any(app.locals.mongoDb.ObjectId),
        "emailSend.key": "123456",
        verified: false,
      },
      expect.any(Array)
    );
  });

  it("should return an error if the key is expired", async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 0,
    });

    await request(app)
      .post("/v1/email-verified")
      .send({ key: "expiredKey" })
      .expect(500);
  });

  it("should return an error if data is not found", async () => {
    mockUpdateOne.mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
    });

    await request(app)
      .post("/v1/email-verified")
      .send({ key: "wrongKey" })
      .expect(500);
  });
});
