import { MongoClient } from "mongodb";
import { Kafka, Producer, Consumer, Admin } from "kafkajs";
import axios from "axios";
import data from "./mock-data.json";

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

describe("Kafka Producer Test", () => {
  it("should get the results from mock server and save it in db", async () => {
    const job = {
      _id: "job1",
      type: "type1",
      country: "country1",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 5, long: 5 },
      ],
      parent_id: null,
      mesh_level: 1,
      is_active: true,
    };

    // Define the message to be sent
    const message = {
      value: JSON.stringify(job),
    };

    // Produce the message
    await kafkaProducer.send({
      topic: "fetch_topic",
      messages: [message],
    });
  });

  it("should get the results from mock server and update jobs in database", async () => {
    // Define the message to be sent
    const message = {
      value: JSON.stringify({ test: "This is a test message" }),
    };

    // Produce the message
    await kafkaProducer.send({
      topic: "fetch_topic",
      messages: [message],
    });
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

async function setupExpectations() {
  try {
    const response = await axios.put(
      `${process.env.MOCK_SERVER}/mockserver/expectation`,
      {
        httpRequest: {
          method: "GET",
          path: "/v3/poi",
          queryStringParameters: {
            output: ["json"],
            countrycode: ["country1"],
            boundingbox: ["(0,0),(5,5)"],
            maxresults: [process.env.MAX_FETCH_BLOCK],
            compact: ["true"],
            verbose: ["false"],
            key: [process.env.API_KEY],
          },
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(data),
          headers: {
            "Content-Type": ["application/json"],
          },
        },
      }
    );

    console.log("Expectation setup response:", response.data);
  } catch (error) {
    console.error("Error setting up expectation:", error);
  }
}
