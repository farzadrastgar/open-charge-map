import { Kafka } from "kafkajs";
import { kafkaConfiguration } from "../config/kafkaConfig";

export const initializeKafkaClient = () =>
  new Kafka({
    clientId: kafkaConfiguration.clientId,
    brokers: kafkaConfiguration.brokers,
  });
