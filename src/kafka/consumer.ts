import { Consumer, KafkaMessage } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";
import { processJob } from "../jobs/jobsProcessor";

const consumer: Consumer = kafka.consumer({
  groupId: kafkaConfiguration.consumerGroupId,
});

export const startConsumer = async (): Promise<void> => {
  await consumer.connect();
  await consumer.subscribe({
    topic: kafkaConfiguration.topic,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }: {
      topic: string;
      partition: number;
      message: KafkaMessage;
    }) => {
      const job = JSON.parse(message.value?.toString() || "{}");
      await processJob(job, topic, partition);
    },
    autoCommit: false,
  });
};
