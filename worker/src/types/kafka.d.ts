export type KafkaConfiguration = {
  clientId: string;
  brokers: string[];
  consumerGroupId: string;
  topic: string;
};
