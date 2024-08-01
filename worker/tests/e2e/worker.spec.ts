import { MongoClient } from "mongodb";
import {
  Kafka,
  Producer,
  Consumer,
  Admin,
  EachMessagePayload,
  Message,
} from "kafkajs";
import { setupExpectations } from "./mock-server-config";
import _ from "lodash";
jest.setTimeout(100000);

// Read environment variables
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://user:pass@mongodb_test:27017/open_charge";
const KAFKA_BROKER = process.env.KAFKA_BROKER || "kafka1_test:9092";

// Global variables for MongoDB and Kafka
let mongoClient: MongoClient;
let kafkaProducer: Producer;
let kafkaConsumer: Consumer;
let kafkaAdmin: Admin;

// Connect to MongoDB and Kafka before all tests
beforeAll(async () => {
  // Set up MongoDB connection
  mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  console.log("Connected to MongoDB");

  // Set up Kafka connection
  const kafka = new Kafka({ brokers: [KAFKA_BROKER] });
  kafkaProducer = kafka.producer();
  kafkaConsumer = kafka.consumer({ groupId: "test-group" });
  kafkaAdmin = kafka.admin();

  await kafkaProducer.connect();
  await kafkaConsumer.connect();
  await kafkaAdmin.createTopics({
    topics: [{ topic: "fetch_topic", numPartitions: 1 }],
  });
  await setupExpectations();
  console.log("Connected to Kafka and created topics");
});

beforeEach(async () => {
  const db = mongoClient.db();
  await db.collection("jobs").deleteMany({});
  await db.collection("pois").deleteMany({});
  console.log("Cleared 'jobs' and 'pois' collections");
});

describe("e2e test", () => {
  it("should get the results from mock server and save new jobs to db", async () => {
    const job = {
      _id: "job1",
      type: "type1",
      country: "country1",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 5, long: 10 },
      ],
      parent_id: null,
      mesh_level: 1,
      is_active: true,
    };

    const db = mongoClient.db();
    await db.collection<typeof job>("jobs").insertOne(job);
    console.log("Inserted job1 into the jobs collection");

    // Define the message to be sent
    const message = {
      value: JSON.stringify(job),
    };

    // Produce the message
    await kafkaProducer.send({
      topic: "fetch_topic",
      messages: [message],
    });

    // Function to consume messages
    const consumeMessages = async (topic: string) => {
      const messages: Message[] = [];
      await kafkaConsumer.subscribe({ topic, fromBeginning: true });

      await new Promise<void>((resolve) => {
        kafkaConsumer.run({
          eachMessage: async ({ message }) => {
            if (messages.length < 3) {
              // Changed to fetch first 3 messages
              messages.push(message);
              if (messages.length === 3) {
                resolve();
              }
            }
          },
        });
      });

      return messages;
    };

    // Fetch messages from Kafka
    const messages = await consumeMessages("fetch_topic");

    // Expect exactly 3 messages
    expect(messages.length).toBe(3);

    // Helper function to parse JSON messages
    const parseMessage = (msg: Message) => {
      if (msg.value !== null) {
        return JSON.parse(msg.value.toString());
      } else {
        throw new Error("Message value is null");
      }
    };

    // Validate the first message
    const firstMessage = parseMessage(messages[0]);
    expect(firstMessage).toStrictEqual(job);

    // Validate the other two messages
    const otherMessages = messages.slice(1).map(parseMessage);
    const messagesWithoutIds = otherMessages.map(({ _id, ...rest }) => rest);

    const expectedResult = [
      {
        bounding_box: [
          {
            lat: 0,
            long: 0,
          },
          {
            lat: 5,
            long: 5,
          },
        ],
        country: "country1",
        is_active: true,
        mesh_level: 2,
        parent_id: "job1",
        type: "type1",
      },
      {
        bounding_box: [
          {
            lat: 0,
            long: 5,
          },
          {
            lat: 5,
            long: 10,
          },
        ],
        country: "country1",
        is_active: true,
        mesh_level: 2,
        parent_id: "job1",
        type: "type1",
      },
    ];
    expect(_.isEqual(messagesWithoutIds, expectedResult)).toBe(true);

    // Fetch jobs from MongoDB
    const jobs = await mongoClient.db().collection("jobs").find().toArray();
    const jobsWithoutIds = jobs.map(({ _id, ...rest }) => rest);

    delete (job as any)._id;
    const expectedJobs = [{ ...job, is_active: false }, ...expectedResult];

    // Check if both arrays contain the same elements, regardless of order
    expect(_.isEqual(jobsWithoutIds, expectedJobs)).toBe(true);
  });
});

// Disconnect from MongoDB and Kafka after all tests
afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("Disconnected from MongoDB");
  }

  if (kafkaAdmin) {
    // Delete topics
    try {
      await kafkaAdmin.deleteTopics({ topics: ["fetch_topic"] });
      console.log("Deleted Kafka topics");
    } catch (error) {
      console.error("Failed to delete Kafka topics:", error);
    }

    // Disconnect Kafka admin
    await kafkaAdmin.disconnect();
  }

  if (kafkaProducer) {
    await kafkaProducer.disconnect();
  }

  if (kafkaConsumer) {
    await kafkaConsumer.disconnect();
  }

  console.log("Disconnected from Kafka");
});
