import { Kafka } from "kafkajs";
import { KafkaConfiguration } from "../types/kafka";

export const kafkaConfiguration: KafkaConfiguration = {
  clientId: "kafka-listener",
  brokers: [process.env.KAFKA_BROKER as string],
  consumerGroupId: "my-group",
  topic: "fetch_topic",
};

const kafka = new Kafka(kafkaConfiguration);

export default kafka;
