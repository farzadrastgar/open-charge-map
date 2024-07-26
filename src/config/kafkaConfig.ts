export type KafkaConfiguration = {
  clientId: string;
  brokers: string[];
  consumerGroupId: string;
  topic: string;
};

export const kafkaConfiguration: KafkaConfiguration = {
  clientId: "kafka-listener",
  brokers: ["localhost:9092"],
  consumerGroupId: "my-group",
  topic: "fetch_topic",
};
