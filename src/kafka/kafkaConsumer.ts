import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { kafkaConfiguration } from "../config/kafkaConfig";
import { initializeKafkaClient } from "./kafkaClient";

export const createConsumer = (kafka: Kafka): Consumer =>
  kafka.consumer({ groupId: kafkaConfiguration.consumerGroupId });

export const connectConsumer = async (consumer: Consumer): Promise<void> => {
  await consumer.connect();
};

export const subscribeToKafkaTopic = async (
  consumer: Consumer
): Promise<void> => {
  await consumer.subscribe({
    topic: kafkaConfiguration.topic,
    fromBeginning: true,
  });
};

export const startConsumer = async (
  consumer: Consumer,
  processMessage: (payload: EachMessagePayload) => Promise<void>
): Promise<void> => {
  await consumer.run({
    eachMessage: async (payload) => processMessage(payload),
  });
};
