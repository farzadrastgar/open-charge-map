import { Producer } from "kafkajs";
import kafka from "../config/kafkaConfig";

const producer: Producer = kafka.producer();

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
