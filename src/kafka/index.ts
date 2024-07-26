import { initializeKafkaClient } from "./kafkaClient";
import {
  createConsumer,
  connectConsumer,
  subscribeToKafkaTopic,
  startConsumer,
} from "./kafkaConsumer";
import { processKafkaMessage } from "./messageProcessor";

const kafkaClient = initializeKafkaClient();
const consumer = createConsumer(kafkaClient);

const startKafkaListener = async (): Promise<void> => {
  await connectConsumer(consumer);
  await subscribeToKafkaTopic(consumer);
  await startConsumer(consumer, processKafkaMessage);
};

startKafkaListener().catch(console.error);
