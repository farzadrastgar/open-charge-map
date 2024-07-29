import { Consumer, KafkaMessage } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";
import { processJob } from "../jobs/jobsProcessor";
import { retryOperation } from "../utils/functions";

const consumer: Consumer = kafka.consumer({
  groupId: kafkaConfiguration.consumerGroupId,
});

export const startConsumer = async (): Promise<void> => {
  await consumer.connect();
  console.log("Consumer is connected");

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
      try {
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 1000; // Delay between retries in milliseconds

        const job = JSON.parse(message.value?.toString() || "{}");
        console.log();
        console.log(`Received message: ${job._id}`);
        await retryOperation(
          async () => {
            await processJob(job);
          },
          maxRetries,
          retryDelay
        );
        console.log("Commiting offsets:", message.offset);
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset, 10) + 1).toString(),
          },
        ]);
      } catch (err) {
        console.log("Error in eachMessage", err);
      }
    },
    autoCommit: false,
  });
};
