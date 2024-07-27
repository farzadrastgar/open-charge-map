import * as dotenv from "dotenv";
dotenv.config();
import { startConsumer } from "./kafka/consumer";
import { startProducer } from "./kafka/producer";
import { connectToDatabase } from "./config/mongoConfig";

const startApplication = async () => {
  try {
    await connectToDatabase();
    await startProducer();
    await startConsumer();
  } catch (error) {
    console.error("Failed to start the application:", error);
  }
};

startApplication();
