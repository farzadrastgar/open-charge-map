// jest.setup.ts
import { Kafka } from "kafkajs";
import { KafkaContainer } from "@testcontainers/kafka";
import { MongoMemoryServer } from "mongodb-memory-server";

let kafkaContainer: any;
let kafkaClient: Kafka;
let mongoServer: MongoMemoryServer;
let mongoUri: string;

beforeAll(async () => {});

afterAll(async () => {});

export { kafkaClient };
