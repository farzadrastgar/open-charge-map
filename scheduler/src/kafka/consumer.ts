import { Consumer } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";

const consumer: Consumer = kafka.consumer({
  groupId: kafkaConfiguration.consumerGroupId,
});

export const createConsumerGroup = async (): Promise<void> => {
  await consumer.connect();
  console.log("Consumer is connected");
};
