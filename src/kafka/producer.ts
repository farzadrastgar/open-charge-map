import { Kafka, Producer } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";

const producer: Producer = kafka.producer();

export const startProducer = async () => {
  await producer.connect();
  console.log("Producer is connected");
};

export const sendMessage = async (
  topic: string,
  messages: string[]
): Promise<void> => {
  await producer.send({
    topic,
    messages: messages.map((message) => ({ value: message })),
  });
};
