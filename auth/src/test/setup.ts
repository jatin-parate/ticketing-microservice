import faker from "@faker-js/faker";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

declare global {
  function signin(): Promise<{
    email: string;
    password: string;
    cookie: string[];
  }>;
}


jest.setTimeout(10000000);

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo?.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = faker.internet.email();
  const password = faker.internet.password(4);

  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return { email, password, cookie };
};
