console.log(process.env);
import { startConsumer } from "./kafka/consumer";
import { startProducer } from "./kafka/producer";

const startApplication = async () => {
  try {
    await startProducer();
    await startConsumer();
  } catch (error) {
    console.error("Failed to start the application:", error);
  }
};

startApplication();
