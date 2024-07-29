import { kafkaConfiguration } from "./config/kafkaConfig";
import { startConsumer } from "./kafka/consumer";
import { createTopicIfNotExists } from "./kafka/createTopic";
import { startProducer } from "./kafka/producer";

const startApplication = async () => {
  try {
    await createTopicIfNotExists(kafkaConfiguration.topic);
    await startProducer();
    await startConsumer();
  } catch (error) {
    console.error("Failed to start the application:", error);
  }
};

startApplication();
