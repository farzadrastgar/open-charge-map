import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { kafkaConfiguration } from "../config/kafkaConfig";
import { initializeKafkaClient } from "./kafkaClient";
import { Job } from "../types/job";

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
    fromBeginning: false,
  });
};

export const startConsumer = async (
  consumer: Consumer,
  processMessage: (job: Job, topic: string, partition: number) => Promise<void>
): Promise<void> => {
  await consumer.run({
    eachMessage: async (payload) => {
      const { topic, partition } = payload;
      const job = parseMessage(payload);
      processMessage(job, topic, partition);
    },
  });
};

const parseMessage = (message: EachMessagePayload): any => {
  const value = message.message.value;
  if (Buffer.isBuffer(value)) {
    return JSON.parse(value.toString()); // Convert Buffer to string
  } else if (typeof value === "string") {
    return JSON.parse(value); // Assuming message is JSON string
  } else {
    throw new Error("Unsupported message format");
  }
};
