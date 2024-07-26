import { Kafka, Producer, ProducerRecord } from "kafkajs";
import { kafkaConfiguration } from "../config/kafkaConfig";

export const createProducer = (kafka: Kafka): Producer => {
  return kafka.producer();
};

export const connectProducer = async (producer: Producer): Promise<void> => {
  await producer.connect();
};

export const sendMessage = async (
  producer: Producer,
  message: { value: string }
): Promise<void> => {
  await producer.send({
    topic: kafkaConfiguration.topic,
    messages: [message],
  });
};
