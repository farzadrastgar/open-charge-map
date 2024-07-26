import { KafkaConfiguration } from "../types/kafka";

export const kafkaConfiguration: KafkaConfiguration = {
  clientId: "kafka-listener",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  consumerGroupId: "my-group",
  topic: "fetch_topic",
};
