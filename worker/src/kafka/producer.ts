import { Producer } from "kafkajs";
import kafka from "../config/kafkaConfig";

const producer: Producer = kafka.producer({
  retry: {
    initialRetryTime: 100, // Initial wait time before retrying in milliseconds
    retries: 8, // Number of retry attempts
    factor: 0.2,
    multiplier: 2,
    maxRetryTime: 5000,
  },
});

export const startProducer = async () => {
  await producer.connect();
  console.log("Producer is connected");
};

export const sendMessage = async (
  topic: string,
  messages: string[]
): Promise<void> => {
  try {
    await producer.send({
      topic,
      messages: messages.map((message) => ({ value: message })),
    });
  } catch (err) {
    console.log("Error in sendMessage to kafka", err);
  }
};
