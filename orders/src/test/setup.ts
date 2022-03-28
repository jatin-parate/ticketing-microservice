import faker from "@faker-js/faker";
import { MongoMemoryServer, MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

declare global {
  function signin(): Promise<{
    email: string;
    password: string;
    cookie: string[];
  }>;
}

jest.setTimeout(100000000);

let mongo: MongoMemoryServer | undefined;
let replSet: MongoMemoryReplSet | undefined;

jest.mock("../nats-wrapper");

beforeAll(async () => {
  try {
    process.env.JWT_KEY = "asdf";
    const replset = await MongoMemoryReplSet.create({
      replSet: { storageEngine: "wiredTiger" },
    }); // This will create an ReplSet with 4 members and storage-engine "wiredTiger"

    await replSet?.waitUntilRunning();
    console.debug("Repl created");

    const mongoUri = replset.getUri();

    console.log(mongoUri);

    // mongo = await MongoMemoryServer.create();
    // const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
    // console.log('Connected to mongo');
  } catch (err) {
    console.error(err);
    throw err;
  }
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await replSet?.stop();
  await mongo?.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = faker.internet.email();
  const password = faker.internet.password(4);

  // Build a JWT payload. { id, email }
  const jwtPayload = { id: new mongoose.Types.ObjectId().toString(), email };

  // Create the JWT!
  const jwtToken = sign(jwtPayload, process.env.JWT_KEY!);

  // Build a session object. { jwt: jwtTokenString }
  const sessionObject = { jwt: jwtToken };

  // Turn that session into json
  const sessionString = JSON.stringify(sessionObject);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionString).toString("base64");
  const cookie: string = `session=${base64}`;

  return { email, password, cookie: [cookie] };
};
