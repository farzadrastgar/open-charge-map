import { Consumer, KafkaMessage } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";
import { processJob } from "../jobs/jobsProcessor";

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
        const job = JSON.parse(message.value?.toString() || "{}");
        await processJob(job);
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
