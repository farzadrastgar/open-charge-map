import { MongoClient } from "mongodb";
import { Kafka, Producer, Consumer, Admin } from "kafkajs";

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
    topics: [{ topic: "test-topic", numPartitions: 1 }],
  });

  console.log("Connected to Kafka and created topics");
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
      await kafkaAdmin.deleteTopics({ topics: ["test-topic"] });
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

export { mongoClient, kafkaProducer, kafkaConsumer, kafkaAdmin };
